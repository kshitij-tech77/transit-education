import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { contestDb } from '@/lib/contest-supabase';
import { getContestUserFromRequest } from '@/lib/contest-auth';
import type { MatchWithPrediction } from '@/types/contest';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Update match statuses based on current time
    const now = new Date().toISOString();

    // upcoming → open (30 min before kickoff)
    await contestDb
      .from('matches')
      .update({ status: 'open' })
      .eq('status', 'upcoming')
      .lte('kickoff_at', new Date(Date.now() + 30 * 60 * 1000).toISOString())
      .gt('kickoff_at', now);

    // open → locked (at locks_at time)
    await contestDb
      .from('matches')
      .update({ status: 'locked' })
      .eq('status', 'open')
      .lte('locks_at', now);

    // Fetch all matches
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .order('kickoff_at', { ascending: true });

    if (matchError) {
      console.error('Matches fetch error:', matchError);
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }

    // If user is authenticated, fetch their predictions
    const authUser = await getContestUserFromRequest(request);
    let predictionsMap: Record<string, object> = {};

    if (authUser) {
      const { data: predictions } = await contestDb
        .from('predictions')
        .select('*')
        .eq('user_id', authUser.userId);

      if (predictions) {
        predictionsMap = Object.fromEntries(
          predictions.map(p => [p.match_id, p])
        );
      }
    }

    const matchesWithPredictions: MatchWithPrediction[] = (matches || []).map(m => ({
      ...m,
      prediction: predictionsMap[m.id] ?? null,
    }));

    return NextResponse.json({
      matches: matchesWithPredictions,
      authenticated: !!authUser,
    });
  } catch (err) {
    console.error('Matches route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
