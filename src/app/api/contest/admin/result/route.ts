import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { contestDb } from '@/lib/contest-supabase';
import type { MatchResult } from '@/types/contest';

const schema = z.object({
  match_id: z.string().uuid(),
  home_score: z.number().int().min(0).max(30),
  away_score: z.number().int().min(0).max(30),
});

// Protected: only service-role callers (CMS admin) may call this
function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-Admin-Key');
  return apiKey === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const { match_id, home_score, away_score } = parsed.data;

    // Determine result
    let result: MatchResult;
    if (home_score > away_score) result = 'home';
    else if (away_score > home_score) result = 'away';
    else result = 'draw';

    // Update match
    const { error: matchUpdateError } = await contestDb
      .from('matches')
      .update({ home_score, away_score, result, status: 'settled' })
      .eq('id', match_id);

    if (matchUpdateError) {
      console.error('Match update error:', matchUpdateError);
      return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
    }

    // Fetch all predictions for this match
    const { data: predictions, error: predictionsError } = await contestDb
      .from('predictions')
      .select('*')
      .eq('match_id', match_id);

    if (predictionsError) {
      console.error('Predictions fetch error:', predictionsError);
      return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
    }

    if (!predictions || predictions.length === 0) {
      return NextResponse.json({ success: true, settled: 0 });
    }

    // Score each prediction
    const updates = predictions.map(p => {
      const isExactScore =
        p.predicted_home_score === home_score && p.predicted_away_score === away_score;
      const isCorrectResult = p.predicted_result === result;

      let points = 0;
      if (isExactScore) points = 5;
      else if (isCorrectResult) points = 2;

      return {
        id: p.id,
        user_id: p.user_id,
        points_earned: points,
        is_exact_score: isExactScore,
        is_correct_result: isCorrectResult,
      };
    });

    // Batch update predictions
    for (const u of updates) {
      await contestDb
        .from('predictions')
        .update({
          points_earned: u.points_earned,
          is_exact_score: u.is_exact_score,
          is_correct_result: u.is_correct_result,
        })
        .eq('id', u.id);
    }

    // Collect affected user IDs
    const affectedUserIds = [...new Set(updates.map(u => u.user_id))];

    // Rebuild leaderboard_cache for each affected user
    for (const userId of affectedUserIds) {
      const { data: userPredictions } = await contestDb
        .from('predictions')
        .select('*')
        .eq('user_id', userId);

      if (!userPredictions) continue;

      // Check streak bonus: 3 consecutive correct results
      const sortedByMatch = userPredictions
        .filter(p => p.is_correct_result)
        .sort((a, b) =>
          new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        );

      let streakBonus = 0;
      if (sortedByMatch.length >= 3) {
        // Simple check: if 3+ correct, award +3 bonus once per 3-streak
        const streakCount = Math.floor(sortedByMatch.length / 3);
        streakBonus = streakCount * 3;
      }

      const totalBasePoints = userPredictions.reduce(
        (sum, p) => sum + (p.points_earned || 0),
        0
      );
      const totalPoints = totalBasePoints + streakBonus;
      const correctResults = userPredictions.filter(p => p.is_correct_result).length;
      const exactScores = userPredictions.filter(p => p.is_exact_score).length;
      const predictionsMade = userPredictions.length;

      // Weekly points: predictions settled in current Mon-Sun window
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysFromMonday);
      weekStart.setHours(0, 0, 0, 0);

      const weeklyPredictions = userPredictions.filter(
        p => new Date(p.submitted_at) >= weekStart
      );
      const weeklyPoints = weeklyPredictions.reduce(
        (sum, p) => sum + (p.points_earned || 0),
        0
      );

      await contestDb.from('leaderboard_cache').upsert(
        {
          user_id: userId,
          total_points: totalPoints,
          correct_results: correctResults,
          exact_scores: exactScores,
          predictions_made: predictionsMade,
          weekly_points: weeklyPoints,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    }

    // Rebuild global ranks
    const { data: allEntries } = await contestDb
      .from('leaderboard_cache')
      .select('user_id, total_points, exact_scores')
      .order('total_points', { ascending: false })
      .order('exact_scores', { ascending: false });

    if (allEntries) {
      for (let i = 0; i < allEntries.length; i++) {
        await contestDb
          .from('leaderboard_cache')
          .update({ rank: i + 1 })
          .eq('user_id', allEntries[i].user_id);
      }
    }

    return NextResponse.json({
      success: true,
      match_id,
      result,
      home_score,
      away_score,
      settled: predictions.length,
    });
  } catch (err) {
    console.error('Admin result error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
