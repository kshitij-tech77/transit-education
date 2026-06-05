import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const ApplicationSchema = z.object({
  full_name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(200).trim(),
  phone: z.string().min(7).max(30).trim(),
  position: z.string().min(1).max(200).trim(),
  cover_letter: z.string().max(2000).trim().optional(),
  cv_url: z.string().max(500).optional(),
  job_opening_id: z.string().uuid().optional().nullable(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/cms/job-applications error:', err);
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
    if (!rateLimit(ip, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = await createClient();
    const body = await req.json();

    const parsed = ApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { full_name, email, phone, position, cover_letter, cv_url, job_opening_id } = parsed.data;

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        full_name,
        email,
        phone,
        position,
        cover_letter: cover_letter || null,
        cv_url: cv_url || null,
        job_opening_id: job_opening_id || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/job-applications error:', err);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 400 });
  }
}
