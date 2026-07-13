import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserEmailMap } from '@/lib/loyalty-admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('loyalty_milestone_completions')
    .select(`*, loyalty_milestones (title)`)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('GET /api/cms/loyalty/completions error:', error);
    return NextResponse.json({ error: 'Failed to load claims' }, { status: 500 });
  }

  const emailMap = await getUserEmailMap();

  const formatted = data.map(c => ({
    id: c.id,
    memberId: c.member_id,
    memberEmail: emailMap.get(c.member_id) ?? null,
    milestoneId: c.milestone_id,
    milestoneTitle: (c as any).loyalty_milestones?.title ?? 'Unknown milestone',
    status: c.status,
    notes: c.notes,
    submittedAt: c.submitted_at,
  }));

  return NextResponse.json(formatted);
}
