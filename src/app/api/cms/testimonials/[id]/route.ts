import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data: updated, error } = await supabaseAdmin
      .from('testimonials')
      .update({
        student_name: body.name,
        course: body.course,
        university: body.university,
        country_id: body.country?.toLowerCase().replace(/\s+/g, '-'),
        body: body.body,
        rating: body.rating,
        photo_url: body.photo
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
    const { error } = await supabaseAdmin
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
