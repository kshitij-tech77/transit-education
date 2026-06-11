import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contest-supabase';
import { getContestUserFromRequest } from '@/lib/contest-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getContestUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const [userResult, leaderboardResult, predictionsResult] = await Promise.all([
      contestDb
        .from('contest_users')
        .select('*')
        .eq('id', authUser.userId)
        .single(),

      contestDb
        .from('leaderboard_cache')
        .select('*')
        .eq('user_id', authUser.userId)
        .single(),

      contestDb
        .from('predictions')
        .select(`*, matches(*)`)
        .eq('user_id', authUser.userId)
        .order('submitted_at', { ascending: false }),
    ]);

    if (userResult.error || !userResult.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: userResult.data,
      leaderboard: leaderboardResult.data ?? null,
      predictions: predictionsResult.data ?? [],
    });
  } catch (err) {
    console.error('Me route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
