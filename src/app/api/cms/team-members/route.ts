import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select(`*, branches:branch_id (name)`)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    const formattedData = data.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      branchId: m.branch_id,
      branch: (m as any).branches?.name || null,
      photo: m.photo_url,
      displayOrder: m.display_order,
      isVisible: m.is_visible,
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error('GET /api/cms/team-members error:', err);
    return NextResponse.json({ error: "Failed to load team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { data: newItem, error } = await supabase
      .from('team_members')
      .insert({
        name: body.name,
        role: body.role,
        branch_id: body.branchId || null,
        photo_url: body.photo,
        display_order: body.displayOrder ?? 0,
        is_visible: body.isVisible ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/cms/team-members error:', error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 400 });
  }
}
