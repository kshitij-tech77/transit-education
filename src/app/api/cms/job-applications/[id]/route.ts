import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from('job_applications')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('PUT /api/cms/job-applications/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const { id } = await params;
    const { error } = await supabase.from('job_applications').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/cms/job-applications/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 400 });
  }
}
