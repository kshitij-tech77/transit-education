import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data: updated, error } = await supabase
      .from('success_stories')
      .update({
        name: body.name,
        country: body.country,
        flag: body.flag,
        university: body.university,
        course: body.course,
        year: body.year,
        image_url: body.approvalImage
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/cms/success-stories/[id] error:', error);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('success_stories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cms/success-stories/[id] error:', error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
