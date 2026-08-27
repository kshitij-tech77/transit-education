import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

// GET is public (see proxy.ts's isPublicGet whitelist) — Hero.tsx reads it
// for homepage country data — so it deliberately has no guard.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
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
      costOfLiving: c.cost_of_living || null,
      scholarshipData: c.scholarship_data || null,
      cityGuides: c.city_guides || null,
      universityList: c.university_list || null,
      visaExtended: c.visa_extended || null,
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
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await req.json();

    const id = (body.slug || body.id || body.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!id) {
      return NextResponse.json({ error: "A name or URL slug is required" }, { status: 400 });
    }

    const { data: newItem, error } = await supabase
      .from('countries')
      .insert({
        id,
        code: (body.code || '').toUpperCase().slice(0, 2),
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

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `A country page with the URL slug "${id}" already exists` }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/cms/countries error:', error);
    return NextResponse.json({ error: "Failed to create country" }, { status: 400 });
  }
}
