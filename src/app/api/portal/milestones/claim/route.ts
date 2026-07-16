import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const ClaimSchema = z.object({
  milestoneId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = ClaimSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { milestoneId } = parsed.data;

  const { data: newClaim, error } = await supabaseAdmin
    .from('loyalty_milestone_completions')
    .insert({ member_id: user.id, milestone_id: milestoneId })
    .select()
    .single();

  if (error) {
    // Partial unique index rejects a second active (PENDING/APPROVED) claim for the same milestone.
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already claimed' }, { status: 409 });
    }
    console.error('POST /api/portal/milestones/claim error:', error);
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 400 });
  }

  return NextResponse.json(newClaim, { status: 201 });
}
