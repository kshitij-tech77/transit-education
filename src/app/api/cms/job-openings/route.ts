import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

// GET is public (see proxy.ts's isPublicGet whitelist) — it self-filters to
// active openings for anonymous callers below — so it deliberately has no
// guard.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('job_openings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!user) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/cms/job-openings error:', err);
    return NextResponse.json({ error: 'Failed to load job openings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await req.json();
    const { data, error } = await supabase
      .from('job_openings')
      .insert({
        title: body.title,
        department: body.department || null,
        location: body.location || 'Kathmandu',
        type: body.type || 'Full-time',
        description: body.description || null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/job-openings error:', err);
    return NextResponse.json({ error: 'Failed to create job opening' }, { status: 400 });
  }
}
