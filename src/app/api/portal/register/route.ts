import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateReferralCode, REFERRAL_SIGNUP_POINTS } from '@/lib/loyalty';
import { z } from 'zod';

const RegisterSchema = z.object({
  referralCode: z.string().max(20).trim().optional(),
});

// Idempotent — called right after OTP verify on the client. Creates the
// loyalty_members row on first login only; a repeat call for an existing
// member is a harmless no-op (so a retried request can never double-credit
// a referral).
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = RegisterSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { referralCode } = parsed.data;

  const { data: existing } = await supabaseAdmin
    .from('loyalty_members')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      id: existing.id,
      referralCode: existing.referral_code,
      pointsBalance: existing.points_balance,
    });
  }

  let referredByMemberId: string | null = null;
  if (referralCode) {
    const { data: referrer } = await supabaseAdmin
      .from('loyalty_members')
      .select('id')
      .ilike('referral_code', referralCode)
      .maybeSingle();
    if (referrer && referrer.id !== user.id) {
      referredByMemberId = referrer.id;
    }
  }

  let newMember = null;
  for (let attempt = 0; attempt < 5 && !newMember; attempt++) {
    const code = generateReferralCode();
    const { data, error } = await supabaseAdmin
      .from('loyalty_members')
      .insert({ id: user.id, referral_code: code, referred_by_member_id: referredByMemberId })
      .select()
      .single();
    if (!error) newMember = data;
    else if (!error.message.includes('duplicate')) break;
  }

  if (!newMember) {
    return NextResponse.json({ error: 'Failed to create loyalty account' }, { status: 500 });
  }

  if (referredByMemberId) {
    await supabaseAdmin.from('loyalty_transactions').insert({
      member_id: referredByMemberId,
      type: 'EARN',
      points: REFERRAL_SIGNUP_POINTS,
      reason_code: 'REFERRAL_SIGNUP',
      related_member_id: user.id,
    });
  }

  return NextResponse.json({
    id: newMember.id,
    referralCode: newMember.referral_code,
    pointsBalance: newMember.points_balance,
  }, { status: 201 });
}
