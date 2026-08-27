import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserEmailMap } from '@/lib/loyalty-admin';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  const { error: authError } = await requireCmsAuth();
  if (authError) return authError;

  // Bounded + paginated: this list grows without limit across all members,
  // so default to the most recent page instead of fetching every row ever.
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabaseAdmin
    .from('loyalty_redemptions')
    .select(`*, loyalty_rewards (title)`)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('GET /api/cms/loyalty/redemptions error:', error);
    return NextResponse.json({ error: 'Failed to load redemptions' }, { status: 500 });
  }

  const emailMap = await getUserEmailMap();

  const formatted = data.map(r => ({
    id: r.id,
    memberId: r.member_id,
    memberEmail: emailMap.get(r.member_id) ?? null,
    rewardTitle: (r as any).loyalty_rewards?.title ?? 'Unknown reward',
    pointsSpent: r.points_spent,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
  }));

  return NextResponse.json(formatted);
}
