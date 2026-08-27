import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserEmailMap } from '@/lib/loyalty-admin';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  const { error: authError } = await requireCmsAuth();
  if (authError) return authError;

  // Bounded + paginated: the member directory grows without limit, so
  // default to the most recent page instead of fetching every row ever.
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: members, error } = await supabaseAdmin
    .from('loyalty_members')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('GET /api/cms/loyalty/members error:', error);
    return NextResponse.json({ error: 'Failed to load members' }, { status: 500 });
  }

  const emailMap = await getUserEmailMap();
  // Only resolves referral codes for referrers within this page — a referrer
  // on a different page will show referredByCode: null. Acceptable tradeoff
  // for bounding this query; the referral relationship itself isn't lost.
  const codeById = new Map(members.map(m => [m.id, m.referral_code as string]));

  const formatted = members.map(m => ({
    id: m.id,
    email: emailMap.get(m.id) ?? null,
    referralCode: m.referral_code,
    referredByCode: m.referred_by_member_id ? (codeById.get(m.referred_by_member_id) ?? null) : null,
    pointsBalance: m.points_balance,
    createdAt: m.created_at,
  }));

  return NextResponse.json(formatted);
}
