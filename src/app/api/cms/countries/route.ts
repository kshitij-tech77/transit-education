import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('countries')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const formattedData = data.map(c => ({
      id: c.id,
      code: c.code,
      flag: c.flag,
      name: c.name,
      status: c.status,
      heroTitle: c.hero_title,
      whyStudy: c.why_study,
      entryRequirements: (c.entry_requirements && typeof c.entry_requirements === 'object' && !Array.isArray(c.entry_requirements))
        ? c.entry_requirements
        : { ug: [], pg: [] },
      visaProcess: Array.isArray(c.visa_process) ? c.visa_process : [],
      intakes: c.intakes,
      visaTime: c.visa_time,
      tuition: c.tuition_range,
      universities: c.top_universities ? c.top_universities.join(', ') : '',
      requiredDocuments: Array.isArray(c.required_documents) ? c.required_documents : [],
      majorIntakesDescription: c.major_intakes_description || '',
      metaTitle: c.meta_title || '',
      metaDescription: c.meta_description || '',
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
    const { data: newItem, error } = await supabaseAdmin
      .from('countries')
      .insert({
        code: body.code,
        flag: body.flag,
        name: body.name,
        status: body.status || 'DRAFT',
        hero_title: body.heroTitle,
        why_study: body.whyStudy,
        intakes: body.intakes,
        visa_time: body.visaTime,
        tuition_range: body.tuition,
        top_universities: body.universities ? body.universities.split(',').map((u: string) => u.trim()) : [],
        entry_requirements: body.entryRequirements || { ug: [], pg: [] },
        visa_process: body.visaProcess || [],
        required_documents: body.requiredDocuments || [],
        major_intakes_description: body.majorIntakesDescription,
        meta_title: body.metaTitle,
        meta_description: body.metaDescription
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
