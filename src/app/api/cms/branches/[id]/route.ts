import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const { data: updated, error } = await supabase
      .from('branches')
      .update({
        name: body.name,
        address: body.addr,
        phone: body.phone,
        manager_name: body.mgr,
        working_hours: body.hours
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/cms/branches/[id] error:', error);
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cms/branches/[id] error:', error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
