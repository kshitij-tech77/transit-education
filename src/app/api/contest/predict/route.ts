import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { contestDb } from '@/lib/contest-supabase';
import { getContestUserFromRequest } from '@/lib/contest-auth';

const schema = z.object({
  match_id: z.string().uuid(),
  predicted_result: z.enum(['home', 'draw', 'away']),
  predicted_home_score: z.number().int().min(0).max(20),
  predicted_away_score: z.number().int().min(0).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await getContestUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid prediction data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { match_id, predicted_result, predicted_home_score, predicted_away_score } = parsed.data;

    // Verify match exists and is open
    const { data: match, error: matchError } = await contestDb
      .from('matches')
      .select('id, status, locks_at')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.status !== 'open') {
      return NextResponse.json(
        { error: 'This match is not open for predictions' },
        { status: 400 }
      );
    }

    if (new Date(match.locks_at) <= new Date()) {
      return NextResponse.json(
        { error: 'Predictions for this match are now locked' },
        { status: 400 }
      );
    }

    // Upsert prediction
    const { data: prediction, error: upsertError } = await contestDb
      .from('predictions')
      .upsert(
        {
          user_id: authUser.userId,
          match_id,
          predicted_result,
          predicted_home_score,
          predicted_away_score,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,match_id' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Prediction upsert error:', upsertError);
      return NextResponse.json({ error: 'Failed to save prediction' }, { status: 500 });
    }

    // Ensure leaderboard cache entry exists for this user
    await contestDb
      .from('leaderboard_cache')
      .upsert(
        { user_id: authUser.userId },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );

    // Update predictions_made count
    const { count } = await contestDb
      .from('predictions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.userId);

    await contestDb
      .from('leaderboard_cache')
      .update({ predictions_made: count ?? 0 })
      .eq('user_id', authUser.userId);

    return NextResponse.json({ success: true, prediction });
  } catch (err) {
    console.error('Predict route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
