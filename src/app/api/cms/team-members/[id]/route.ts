import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const { data: updated, error } = await supabase
      .from('team_members')
      .update({
        name: body.name,
        role: body.role,
        branch_id: body.branchId || null,
        photo_url: body.photo,
        display_order: body.displayOrder ?? 0,
        is_visible: body.isVisible ?? true,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/cms/team-members/[id] error:', error);
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cms/team-members/[id] error:', error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
