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
      .from('faqs')
      .update({
        question: body.question,
        answer: body.answer,
        category: body.category,
        page_path: body.page,
        status: body.status?.toLowerCase(),
        is_featured: body.featured,
        display_order: body.order
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/cms/faqs/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
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
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/cms/faqs/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
