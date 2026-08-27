import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

// GET is public (see proxy.ts's isPublicGet whitelist) — it self-filters to
// published/future events for anonymous callers below — so it deliberately
// has no guard.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (!user) {
      query = query
        .eq('is_published', true)
        .gte('event_date', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/cms/events error:', err);
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await req.json();
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: body.title,
        event_date: body.event_date,
        description: body.description || null,
        location: body.location || 'Online',
        registration_link: body.registration_link || null,
        is_published: body.is_published ?? false,
        banner_image: body.banner_image || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/events error:', err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 400 });
  }
}
