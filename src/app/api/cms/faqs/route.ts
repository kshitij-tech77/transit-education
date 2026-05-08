import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Transform for compatibility (status is lowercase in DB, UI expects capitalized)
    const formattedData = data.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category,
      page: item.page_path,
      featured: item.is_featured,
      order: item.display_order,
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      createdAt: item.created_at
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error('GET /api/cms/faqs error:', err);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { data: newItem, error } = await supabase
      .from('faqs')
      .insert({
        question: body.question,
        answer: body.answer,
        category: body.category,
        page_path: body.page || 'Homepage',
        status: body.status?.toLowerCase() || 'published',
        is_featured: !!body.featured,
        display_order: body.order || 0
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/faqs error:', err);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
