import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const FranchiseSchema = z.object({
  full_name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(200).trim(),
  phone: z.string().min(7).max(30).trim(),
  city: z.string().min(1).max(100).trim(),
  business_background: z.string().max(2000).trim().optional(),
  message: z.string().max(1000).trim().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('franchise_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/cms/franchise-inquiries error:', err);
    return NextResponse.json({ error: 'Failed to load inquiries' }, { status: 500 });
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

    const parsed = FranchiseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { full_name, email, phone, city, business_background, message } = parsed.data;

    const { data, error } = await supabase
      .from('franchise_inquiries')
      .insert({
        full_name,
        email,
        phone,
        city,
        business_background: business_background || null,
        message: message || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/franchise-inquiries error:', err);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 400 });
  }
}
