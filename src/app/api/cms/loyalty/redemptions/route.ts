import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserEmailMap } from '@/lib/loyalty-admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('loyalty_redemptions')
    .select(`*, loyalty_rewards (title)`)
    .order('created_at', { ascending: false });

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
