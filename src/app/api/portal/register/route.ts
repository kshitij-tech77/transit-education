import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateReferralCode, REFERRAL_SIGNUP_POINTS } from '@/lib/loyalty';
import { awardReferralConversionBonus } from '@/lib/loyalty-admin';
import { z } from 'zod';

const RegisterSchema = z.object({
  referralCode: z.string().max(20).trim().optional(),
});

// Escapes ILIKE wildcard characters so an exact-match lookup can't be
// widened by a literal `%` or `_` in the user's own email address (e.g.
// "john_doe@example.com" would otherwise match "johnxdoe@example.com" too,
// since `_` means "any one character" to ILIKE).
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, char => `\\${char}`);
}

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

  // Best-effort auto-link to an existing student/lead record by email, plus
  // the referral conversion bonus if this signup was referred and the link
  // is unambiguous. Never blocks or fails signup — this is enrichment, not
  // a gate, so any failure here is caught and logged rather than surfaced.
  try {
    if (user.email) {
      const { data: matches } = await supabaseAdmin
        .from('students')
        .select('id')
        .ilike('email', escapeLikePattern(user.email));

      // Exactly one match only — 0 or 2+ candidates are left for staff to
      // link manually via the CMS, rather than guessing and possibly
      // crediting the referral conversion bonus to the wrong lead.
      if (matches && matches.length === 1) {
        await supabaseAdmin
          .from('loyalty_members')
          .update({ student_id: matches[0].id })
          .eq('id', newMember.id);

        if (referredByMemberId) {
          await awardReferralConversionBonus(newMember.id);
        }
      }
    }
  } catch (err) {
    console.error('POST /api/portal/register auto-link error:', err);
  }

  return NextResponse.json({
    id: newMember.id,
    referralCode: newMember.referral_code,
    pointsBalance: newMember.points_balance,
  }, { status: 201 });
}
