import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Public lead form — no auth. Tight limits, status never accepted from caller.
const PublicLeadSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  phone: z.string().min(7).max(30).trim(),
  country: z.string().max(100).trim().optional(),
  notes: z.string().max(500).trim().optional(),
});

// CMS admin form — authenticated. Allows all fields.
const AdminStudentSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.union([z.string().email().max(200), z.literal('')]).optional(),
  phone: z.string().max(30).trim().optional(),
  country: z.string().max(100).trim().optional(),
  branch: z.string().max(100).trim().optional(),
  counselor: z.string().max(100).trim().optional(),
  status: z.enum(['PENDING', 'CONTACTED', 'ENROLLED', 'REJECTED', 'APPROVED', 'NOT_INTERESTED']).optional(),
  notes: z.string().max(2000).trim().optional(),
});

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
    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json();

    let name: string;
    let email: string | undefined;
    let phone: string | undefined;
    let country: string | undefined;
    let branch: string | undefined;
    let counselor: string | undefined;
    let status: string;
    let notes: string | undefined;

    if (user) {
      // Authenticated CMS admin — validate with permissive schema
      const parsed = AdminStudentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }
      ({ name, email, phone, country, branch, counselor, notes } = parsed.data);
      status = parsed.data.status || 'PENDING';
    } else {
      // Public lead form — rate limit then validate with strict schema, force status
      const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
      if (!rateLimit(ip, 5, 60_000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }

      const parsed = PublicLeadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
      }
      ({ name, phone, country, notes } = parsed.data);
      status = 'PENDING';
    }

    // Lookup branch_id if branch name is provided
    let branchId = null;
    if (branch) {
      const { data: branchRow } = await supabase
        .from('branches')
        .select('id')
        .eq('name', branch)
        .maybeSingle();
      branchId = branchRow?.id;
    }

    const { data: newItem, error } = await supabase
      .from('students')
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        branch_id: branchId,
        interested_country_id: country?.toLowerCase().replace(/\s+/g, '-'),
        counselor_name: counselor || null,
        status,
        notes: notes || null,
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
