import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;

    // Transform for compatibility (hero_title -> heroTitle, etc.)
    const formattedData = data.map(c => ({
      id: c.id,
      code: c.code,
      flag: c.flag,
      name: c.name,
      status: c.status,
      heroTitle: c.hero_title,
      whyStudy: c.why_study,
      intakes: c.intakes,
      visaTime: c.visa_time,
      tuition: c.tuition_range,
      universities: c.top_universities ? c.top_universities.join(', ') : '',
      lastEdited: c.updated_at
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error('GET /api/cms/countries error:', err);
    return NextResponse.json({ error: "Failed to load countries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data: newItem, error } = await supabase
      .from('countries')
      .insert({
        id: body.id,
        code: body.code,
        flag: body.flag,
        name: body.name,
        status: body.status || 'DRAFT',
        hero_title: body.heroTitle,
        why_study: body.whyStudy,
        intakes: body.intakes,
        visa_time: body.visaTime,
        tuition_range: body.tuition,
        top_universities: body.universities ? body.universities.split(',').map((u: string) => u.trim()) : []
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/cms/countries error:', error);
    return NextResponse.json({ error: "Failed to create country" }, { status: 400 });
  }
}
