import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/cms/resources error:', err);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data: newItem, error } = await supabase
      .from('resources')
      .insert({
        title: body.title,
        category: body.category,
        type: body.type,
        url: body.url,
        file_size: body.file_size,
        status: body.status || 'published',
        display_order: body.display_order || 0
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/resources error:', err);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
