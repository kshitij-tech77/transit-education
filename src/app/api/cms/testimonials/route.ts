import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        countries:country_id (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Transform for compatibility
    const formattedData = data.map(t => ({
      id: t.id,
      name: t.student_name,
      course: t.course,
      university: t.university,
      country: (t as any).countries?.name || t.country_id,
      body: t.body,
      rating: t.rating,
      photo: t.photo_url
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error('GET /api/cms/testimonials error:', err);
    return NextResponse.json({ error: "Failed to load testimonials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data: newItem, error } = await supabase
      .from('testimonials')
      .insert({
        student_name: body.name,
        course: body.course,
        university: body.university,
        country_id: body.country?.toLowerCase().replace(/\s+/g, '-'),
        body: body.body,
        rating: body.rating,
        photo_url: body.photo
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/cms/testimonials error:', error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 400 });
  }
}
