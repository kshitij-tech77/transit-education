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
      .from('testimonials')
      .update({
        name: body.name,
        country: body.country,
        course: body.course,
        university: body.university,
        body: body.body,
        rating: body.rating,
        image_url: body.photo
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/cms/testimonials/[id] error:', error);
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cms/testimonials/[id] error:', error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
