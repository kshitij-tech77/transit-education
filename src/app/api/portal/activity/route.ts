import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { unstable_cache } from 'next/cache';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Defensive per-source cap for a single member's history — this endpoint is
// always scoped to one member (not a global feed), so this is generous
// headroom rather than a real limitation at this program's scale. Mirrors
// the "bounded defensively regardless" idiom already used for per-member
// queries in portal/dashboard/page.tsx.
const SOURCE_FETCH_CAP = 200;

const REASON_CODE_TITLES: Record<string, string> = {
  MILESTONE_COMPLETED: 'Milestone completed',
  REFERRAL_SIGNUP: 'Referral bonus earned',
  REFERRAL_MILESTONE_BONUS: 'Referral milestone bonus earned',
  // Only reached for type=EARN rows (a rejected redemption's refund) — the
  // type=REDEEM row with this same reason_code is intentionally never
  // fetched here, see comment on getCachedActivity below.
  REDEMPTION: 'Points refunded',
};

interface ActivityItem {
  id: string;
  type: 'EARN' | 'REDEEM';
  title: string;
  points: number;
  timestamp: string;
  status: string | null;
  reason_code: string | null;
}

function getCachedActivity(memberId: string) {
  return unstable_cache(
    async (): Promise<ActivityItem[]> => {
      // loyalty_redeem() (the RPC students call to redeem a reward) inserts
      // BOTH a loyalty_redemptions row AND a loyalty_transactions row
      // (type REDEEM, reason_code REDEMPTION) for the same event — see
      // loyalty_redeem() in schema.sql. Fetching only type=EARN transactions
      // here avoids showing every redemption twice; the REDEEM side of the
      // feed comes exclusively from loyalty_redemptions below, which also
      // carries the reward title and PENDING/FULFILLED/REJECTED status that
      // the transaction row doesn't have.
      const [{ data: earnRows }, { data: redemptionRows }] = await Promise.all([
        supabaseAdmin
          .from('loyalty_transactions')
          .select('id, points, reason_code, created_at')
          .eq('member_id', memberId)
          .eq('type', 'EARN')
          .order('created_at', { ascending: false })
          .limit(SOURCE_FETCH_CAP),
        supabaseAdmin
          .from('loyalty_redemptions')
          .select('id, points_spent, status, created_at, loyalty_rewards (title)')
          .eq('member_id', memberId)
          .order('created_at', { ascending: false })
          .limit(SOURCE_FETCH_CAP),
      ]);

      const earnItems: ActivityItem[] = (earnRows ?? []).map(t => ({
        id: t.id,
        type: 'EARN' as const,
        title: REASON_CODE_TITLES[t.reason_code ?? ''] ?? 'Points adjustment',
        points: t.points,
        timestamp: t.created_at,
        status: null,
        reason_code: t.reason_code,
      }));

      const redeemItems: ActivityItem[] = (redemptionRows ?? []).map(r => ({
        id: r.id,
        type: 'REDEEM' as const,
        title: (r as any).loyalty_rewards?.title ?? 'Reward redeemed',
        points: -r.points_spent,
        timestamp: r.created_at,
        status: r.status,
        reason_code: null,
      }));

      return [...earnItems, ...redeemItems].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    ['portal-activity', memberId],
    { revalidate: 120, tags: [`portal-activity-${memberId}`] }
  );
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

  let allItems: ActivityItem[];
  try {
    allItems = await getCachedActivity(user.id)();
  } catch (error) {
    console.error('GET /api/portal/activity error:', error);
    return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 });
  }

  const from = (page - 1) * limit;
  const items = allItems.slice(from, from + limit);

  return NextResponse.json({ items, total: allItems.length, page, limit });
}
