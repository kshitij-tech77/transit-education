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
      .from('resources')
      .update({
        title: body.title,
        category: body.category,
        type: body.type,
        url: body.url,
        file_size: body.file_size,
        status: body.status,
        display_order: body.display_order
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/cms/resources/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
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
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/cms/resources/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
