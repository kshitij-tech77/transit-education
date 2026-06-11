import { supabase } from '@/lib/supabase';
import type { Match, Prize, LeaderboardEntry } from '@/types/contest';
import LandingClient from './LandingClient';

export const dynamic = 'force-dynamic';

export default async function PredictPage() {
  const [matchesRes, prizesRes, leaderboardRes] = await Promise.all([
    supabase
      .from('matches')
      .select('*')
      .order('kickoff_at', { ascending: true }),
    supabase
      .from('prizes')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('leaderboard_cache')
      .select(`
        id, user_id, total_points, correct_results, exact_scores, predictions_made, rank, weekly_points, updated_at,
        contest_users (display_name, city, avatar_color, email)
      `)
      .order('total_points', { ascending: false })
      .order('exact_scores', { ascending: false })
      .limit(5),
  ]);

  const matches = (matchesRes.data || []) as Match[];
  const prizes  = (prizesRes.data || []) as Prize[];
  const leaderboard = (leaderboardRes.data || []) as LeaderboardEntry[];

  const openMatches = matches.filter(m => m.status === 'open');

  return (
    <LandingClient
      initialMatches={matches}
      prizes={prizes}
      initialLeaderboard={leaderboard}
      openCount={openMatches.length}
    />
  );
}
