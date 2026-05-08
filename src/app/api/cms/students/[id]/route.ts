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

    // Handle branch lookup if name provided
    let branchId = body.branch_id;
    if (body.branch && !branchId) {
      const { data: branch } = await supabase
        .from('branches')
        .select('id')
        .eq('name', body.branch)
        .maybeSingle();
      if (branch) branchId = branch.id;
    }

    const { data: updated, error } = await supabase
      .from('students')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        branch_id: branchId,
        interested_country_id: body.country?.toLowerCase().replace(/\s+/g, '-'),
        counselor_name: body.counselor,
        status: body.status?.toUpperCase(),
        notes: body.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/cms/students/[id] error:', error);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
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
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cms/students/[id] error:', error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
