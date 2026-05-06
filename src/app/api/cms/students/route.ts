import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        branches (name),
        countries:interested_country_id (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Transform for compatibility
    const formattedData = data.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      branch: (s as any).branches?.name || 'N/A',
      country: (s as any).countries?.name || s.interested_country_id,
      counselor: s.counselor_name,
      status: s.status,
      notes: s.notes,
      date: s.applied_date
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error('GET /api/cms/students error:', err);
    return NextResponse.json({ error: "Failed to load students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    
    // Lookup branch_id if branch name is provided
    let branchId = null;
    if (body.branch) {
      const { data: branch } = await supabase
        .from('branches')
        .select('id')
        .eq('name', body.branch)
        .maybeSingle();
      branchId = branch?.id;
    }

    const { data: newItem, error } = await supabase
      .from('students')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone,
        branch_id: branchId,
        interested_country_id: body.country?.toLowerCase().replace(/\s+/g, '-'),
        counselor_name: body.counselor,
        status: body.status || 'PENDING',
        notes: body.notes,
        applied_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/cms/students error:', error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 400 });
  }
}
