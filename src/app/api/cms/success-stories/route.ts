import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('success_stories')
      .select(`
        *,
        countries:country_id (name, code, flag)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data.length > 0) console.log('[success-stories GET] first raw row keys:', Object.keys(data[0]), 'id value:', (data[0] as any).id);

    const formattedData = data.map(s => {
      const countryData = (s as any).countries;
      const flag = countryData?.flag || '';
      return {
        id: s.id,
        name: s.student_name,
        country: countryData?.name || s.country_id,
        flag,
        university: s.university,
        year: s.year,
        course: s.course,
        approvalImage: s.approval_image_url || ''
      };
    });

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error('GET /api/cms/success-stories error:', err);
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { data: newItem, error } = await supabase
      .from('success_stories')
      .insert({
        student_name: body.name,
        country_id: body.country?.toLowerCase().replace(/\s+/g, '-'),
        university: body.university,
        year: body.year,
        course: body.course,
        approval_image_url: body.approvalImage
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/cms/success-stories error:', error);
    return NextResponse.json({ error: "Failed to create story" }, { status: 400 });
  }
}
