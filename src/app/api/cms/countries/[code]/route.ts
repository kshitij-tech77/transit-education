import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .or(`id.eq.${code},code.eq.${code.toUpperCase()}`)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Country not found" }, { status: 404 });

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/cms/countries/[code] error:', error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();

    const { data: updated, error } = await supabase
      .from('countries')
      .update({
        name: body.name,
        code: body.code,
        flag: body.flag,
        hero_title: body.heroTitle,
        why_study: body.whyStudy,
        entry_requirements: body.entryRequirements,
        visa_process: body.visaProcess,
        intakes: body.intakes,
        visa_time: body.visaTime,
        tuition_range: body.tuition,
        status: body.status,
        top_universities: body.universities ? (Array.isArray(body.universities) ? body.universities : body.universities.split(',').map((u: string) => u.trim())) : []
      })
      .or(`id.eq.${code},code.eq.${code.toUpperCase()}`)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/cms/countries/[code] error:', error);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { error } = await supabase
      .from('countries')
      .delete()
      .or(`id.eq.${code},code.eq.${code.toUpperCase()}`);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cms/countries/[code] error:', error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
