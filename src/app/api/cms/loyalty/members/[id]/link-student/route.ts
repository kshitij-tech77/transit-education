import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardReferralConversionBonus } from '@/lib/loyalty-admin';
import { z } from 'zod';

const LinkStudentSchema = z.object({
  studentId: z.string().uuid(),
});

// Manual counterpart to the auto-link done at signup (register/route.ts) —
// covers cases where auto-link didn't fire: no email match at signup, or
// the student record was created after the loyalty account already
// existed. Staff pick the exact student here, so there's no ambiguous-match
// case to handle (unlike the email-matching paths).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: memberId } = await params;
  const parsed = LinkStudentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { studentId } = parsed.data;

  const { data: member, error: memberError } = await supabaseAdmin
    .from('loyalty_members')
    .select('id')
    .eq('id', memberId)
    .maybeSingle();
  if (memberError || !member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  const { data: student, error: studentError } = await supabaseAdmin
    .from('students')
    .select('id')
    .eq('id', studentId)
    .maybeSingle();
  if (studentError || !student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('loyalty_members')
    .update({ student_id: studentId })
    .eq('id', memberId)
    .select()
    .single();
  if (updateError) {
    console.error('POST /api/cms/loyalty/members/[id]/link-student error:', updateError);
    return NextResponse.json({ error: 'Failed to link student' }, { status: 500 });
  }

  // No-op if the member wasn't referred, the referral was somehow a
  // self-referral, or this member's conversion bonus was already paid
  // (e.g. by auto-link at signup, or a previous manual link) — see
  // awardReferralConversionBonus for the exact guards.
  await awardReferralConversionBonus(memberId);

  return NextResponse.json({
    id: updated.id,
    studentId: updated.student_id,
    pointsBalance: updated.points_balance,
  });
}
