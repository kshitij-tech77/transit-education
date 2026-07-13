/**
 * Server-only helpers shared by CMS loyalty routes and the portal's own
 * loyalty API routes. auth.users isn't exposed via PostgREST, so member
 * emails have to be resolved through the admin API rather than a normal
 * `.from('loyalty_members').select(...)` join.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import { REFERRAL_CONVERSION_POINTS } from '@/lib/loyalty';
import { revalidateTag } from 'next/cache';

export async function getUserEmailMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    for (const u of data.users) {
      if (u.email) map.set(u.id, u.email);
    }
    if (data.users.length < perPage) break;
    page++;
  }

  return map;
}

/**
 * Awards the referral conversion bonus to a member's referrer, once that
 * member (`memberId`) has been linked to a real student record. Shared by
 * the register route's auto-link-on-signup path and the CMS's manual
 * link-student endpoint, so there is exactly one place this logic lives.
 *
 * Safe to call speculatively — it's a no-op if the member wasn't referred,
 * if the referral is (somehow) a self-referral, or if this member's
 * conversion bonus was already paid out (checked via related_member_id on
 * existing REFERRAL_CONVERSION transactions, not a stored flag).
 */
export async function awardReferralConversionBonus(memberId: string): Promise<void> {
  const { data: member } = await supabaseAdmin
    .from('loyalty_members')
    .select('referred_by_member_id')
    .eq('id', memberId)
    .single();
  if (!member?.referred_by_member_id) return;
  if (member.referred_by_member_id === memberId) return; // defensive: self-referral can't happen today, but never pay it out if it did

  const { data: alreadyAwarded } = await supabaseAdmin
    .from('loyalty_transactions')
    .select('id')
    .eq('reason_code', 'REFERRAL_CONVERSION')
    .eq('related_member_id', memberId)
    .maybeSingle();
  if (alreadyAwarded) return;

  const referrerId = member.referred_by_member_id;
  const { data: referrer } = await supabaseAdmin
    .from('loyalty_members')
    .select('lifetime_points_earned')
    .eq('id', referrerId)
    .single();
  if (!referrer) return;

  const { error: transactionError } = await supabaseAdmin.from('loyalty_transactions').insert({
    member_id: referrerId,
    type: 'EARN',
    points: REFERRAL_CONVERSION_POINTS,
    reason_code: 'REFERRAL_CONVERSION',
    related_member_id: memberId,
  });
  if (transactionError) {
    console.error('awardReferralConversionBonus transaction error:', transactionError);
    return;
  }

  // points_balance updated by DB trigger on loyalty_transactions insert — do not double-update
  await supabaseAdmin
    .from('loyalty_members')
    .update({ lifetime_points_earned: referrer.lifetime_points_earned + REFERRAL_CONVERSION_POINTS })
    .eq('id', referrerId);

  revalidateTag(`portal-activity-${referrerId}`, 'max');
}
