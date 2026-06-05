import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from('job_openings')
      .update({
        title: body.title,
        department: body.department || null,
        location: body.location || 'Kathmandu',
        type: body.type || 'Full-time',
        description: body.description || null,
        is_active: body.is_active ?? true,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('PUT /api/cms/job-openings/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update job opening' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { error } = await supabase.from('job_openings').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/cms/job-openings/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete job opening' }, { status: 400 });
  }
}
