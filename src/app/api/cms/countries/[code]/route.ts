import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

function parseJsonField(value: unknown): unknown {
  if (!value) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}

// Validates that the code/id param contains only safe characters.
// Blocks all PostgREST special chars (commas, dots, parens, percent) that
// would allow injection into the .or() filter string.
function isValidCode(code: string): boolean {
  return /^[a-zA-Z0-9_-]{1,100}$/.test(code);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const { code } = await params;

    if (!isValidCode(code)) {
      return NextResponse.json({ error: 'Invalid country code' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .or(`id.eq.${code},code.eq.${code.toUpperCase()}`)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Country not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/cms/countries/[code] error:', error);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const { code } = await params;

    if (!isValidCode(code)) {
      return NextResponse.json({ error: 'Invalid country code' }, { status: 400 });
    }

    const supabase = await createClient();
    const body = await req.json();

    const { data: updated, error } = await supabase
      .from('countries')
      .update({
        name: body.name,
        code: body.code,
        flag: body.flag,
        hero_title: body.heroTitle,
        why_study: body.whyStudy,
        entry_requirements: body.entryRequirements || { ug: [], pg: [] },
        visa_process: body.visaProcess || [],
        intakes: body.intakes,
        visa_time: body.visaTime,
        tuition_range: body.tuition,
        status: body.status,
        top_universities: body.universities
          ? (Array.isArray(body.universities) ? body.universities : body.universities.split(',').map((u: string) => u.trim()))
          : [],
        required_documents: body.requiredDocuments || [],
        major_intakes_description: body.majorIntakesDescription,
        meta_title: body.metaTitle,
        meta_description: body.metaDescription,
        cost_of_living: parseJsonField(body.costOfLiving),
        scholarship_data: parseJsonField(body.scholarshipData),
        city_guides: parseJsonField(body.cityGuides),
        university_list: parseJsonField(body.universityList),
        visa_extended: parseJsonField(body.visaExtended)
      })
      .or(`id.eq.${code},code.eq.${code.toUpperCase()}`)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/cms/countries/[code] error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const { code } = await params;

    if (!isValidCode(code)) {
      return NextResponse.json({ error: 'Invalid country code' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('countries')
      .delete()
      .or(`id.eq.${code},code.eq.${code.toUpperCase()}`);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cms/countries/[code] error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
