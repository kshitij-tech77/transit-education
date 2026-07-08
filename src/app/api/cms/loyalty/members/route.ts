import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserEmailMap } from '@/lib/loyalty-admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: members, error } = await supabaseAdmin
    .from('loyalty_members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('GET /api/cms/loyalty/members error:', error);
    return NextResponse.json({ error: 'Failed to load members' }, { status: 500 });
  }

  const emailMap = await getUserEmailMap();
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
