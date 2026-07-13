import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const StatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().max(500).trim().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const parsed = StatusSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { status, notes } = parsed.data;

  const { data: completion, error: fetchError } = await supabaseAdmin
    .from('loyalty_milestone_completions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !completion) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }
  if (completion.status !== 'PENDING') {
    return NextResponse.json({ error: `Already ${completion.status.toLowerCase()}` }, { status: 400 });
  }

  // Points are only ever credited here, on approval — unlike redemptions,
  // nothing was deducted at claim time, so rejecting needs no point reversal.
  if (status === 'APPROVED') {
    const { data: milestone, error: milestoneError } = await supabaseAdmin
      .from('loyalty_milestones')
      .select('points, referrer_bonus_points')
      .eq('id', completion.milestone_id)
      .single();
    if (milestoneError || !milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 400 });
    }

    const { data: member, error: memberError } = await supabaseAdmin
      .from('loyalty_members')
      .select('points_balance, lifetime_points_earned, referred_by_member_id')
      .eq('id', completion.member_id)
      .single();
    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 400 });
    }

    const { error: transactionError } = await supabaseAdmin.from('loyalty_transactions').insert({
      member_id: completion.member_id,
      type: 'EARN',
      points: milestone.points,
      reason_code: 'MILESTONE_COMPLETED',
    });
    if (transactionError) {
      console.error('PUT /api/cms/loyalty/completions/[id] transaction error:', transactionError);
      return NextResponse.json({ error: 'Failed to credit points' }, { status: 500 });
    }

    // points_balance updated by DB trigger on loyalty_transactions insert — do not double-update
    await supabaseAdmin
      .from('loyalty_members')
      .update({
        lifetime_points_earned: member.lifetime_points_earned + milestone.points,
      })
      .eq('id', completion.member_id);

    if (member.referred_by_member_id && milestone.referrer_bonus_points) {
      const { data: referrer } = await supabaseAdmin
        .from('loyalty_members')
        .select('points_balance, lifetime_points_earned')
        .eq('id', member.referred_by_member_id)
        .single();

      if (referrer) {
        await supabaseAdmin.from('loyalty_transactions').insert({
          member_id: member.referred_by_member_id,
          type: 'EARN',
          points: milestone.referrer_bonus_points,
          reason_code: 'REFERRAL_MILESTONE_BONUS',
          related_member_id: completion.member_id,
        });

        // points_balance updated by DB trigger on loyalty_transactions insert — do not double-update
        await supabaseAdmin
          .from('loyalty_members')
          .update({
            lifetime_points_earned: referrer.lifetime_points_earned + milestone.referrer_bonus_points,
          })
          .eq('id', member.referred_by_member_id);
      }
    }
  }

  const { data: updated, error } = await supabaseAdmin
    .from('loyalty_milestone_completions')
    .update({ status, notes: notes || null, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('PUT /api/cms/loyalty/completions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 400 });
  }
  return NextResponse.json(updated);
}
