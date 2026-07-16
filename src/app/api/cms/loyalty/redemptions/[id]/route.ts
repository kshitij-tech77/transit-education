import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const StatusSchema = z.object({
  status: z.enum(['FULFILLED', 'REJECTED']),
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

  const { data: redemption, error: fetchError } = await supabaseAdmin
    .from('loyalty_redemptions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !redemption) {
    return NextResponse.json({ error: 'Redemption not found' }, { status: 404 });
  }
  if (redemption.status !== 'PENDING') {
    return NextResponse.json({ error: `Already ${redemption.status.toLowerCase()}` }, { status: 400 });
  }

  // Rejecting refunds the spent points and restores stock — only ever from PENDING,
  // so this can't double-refund a redemption that's already been decided.
  if (status === 'REJECTED') {
    const { error: refundError } = await supabaseAdmin
      .from('loyalty_transactions')
      .insert({
        member_id: redemption.member_id,
        type: 'EARN',
        points: redemption.points_spent,
        reason_code: 'REDEMPTION',
      });
    if (refundError) {
      console.error('PUT /api/cms/loyalty/redemptions/[id] refund error:', refundError);
      return NextResponse.json({ error: 'Failed to refund points' }, { status: 500 });
    }

    const { data: reward } = await supabaseAdmin
      .from('loyalty_rewards')
      .select('stock')
      .eq('id', redemption.reward_id)
      .single();
    if (reward?.stock !== null && reward?.stock !== undefined) {
      await supabaseAdmin
        .from('loyalty_rewards')
        .update({ stock: reward.stock + 1 })
        .eq('id', redemption.reward_id);
    }
  }

  const { data: updated, error } = await supabaseAdmin
    .from('loyalty_redemptions')
    .update({ status, notes: notes || null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('PUT /api/cms/loyalty/redemptions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update redemption' }, { status: 400 });
  }
  return NextResponse.json(updated);
}
