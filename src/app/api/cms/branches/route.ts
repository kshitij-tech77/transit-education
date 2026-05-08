import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const formattedData = data.map(b => ({
      id: b.id,
      name: b.name,
      addr: b.address,
      phone: b.phone,
      mgr: b.manager_name,
      hours: b.working_hours,
      count: b.student_count
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error('GET /api/cms/branches error:', err);
    return NextResponse.json({ error: "Failed to load branches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { data: newItem, error } = await supabase
      .from('branches')
      .insert({
        name: body.name,
        address: body.addr,
        phone: body.phone,
        manager_name: body.mgr,
        working_hours: body.hours,
        student_count: body.count || 0
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/cms/branches error:', error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 400 });
  }
}
