import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserEmailMap } from '@/lib/loyalty-admin';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  const { error: authError } = await requireCmsAuth();
  if (authError) return authError;

  // Bounded + paginated: this list grows without limit across all members,
  // so default to the most recent page instead of fetching every row ever.
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabaseAdmin
    .from('loyalty_milestone_completions')
    .select(`*, loyalty_milestones (title)`)
    .order('submitted_at', { ascending: false })
    .range(from, to);

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
