import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'overall';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const offset = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from('leaderboard_cache')
      .select(
        `
        id,
        user_id,
        total_points,
        correct_results,
        exact_scores,
        predictions_made,
        rank,
        weekly_points,
        updated_at,
        contest_users (
          display_name,
          city,
          avatar_color,
          email
        )
      `,
        { count: 'exact' }
      )
      .range(offset, offset + PAGE_SIZE - 1);

    if (period === 'weekly') {
      query = query.order('weekly_points', { ascending: false }).order('exact_scores', { ascending: false });
    } else {
      query = query.order('total_points', { ascending: false }).order('exact_scores', { ascending: false });
    }

    const { data: entries, error, count } = await query;

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    return NextResponse.json({
      entries: entries || [],
      total: count ?? 0,
      page,
    });
  } catch (err) {
    console.error('Leaderboard route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
