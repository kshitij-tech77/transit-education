import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;

    const socials = (data.social_links as any) || {};
    return NextResponse.json({
      siteName: data.site_name,
      tagline: data.tagline,
      email: data.contact_email,
      phone: data.contact_phone,
      address: data.office_address,
      facebookUrl: socials.facebook || '',
      instagramUrl: socials.instagram || '',
      linkedinUrl: socials.linkedin || '',
      whatsappNumber: socials.whatsapp || ''
    });
  } catch (err) {
    console.error('GET /api/cms/settings error:', err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { data: updated, error } = await supabase
      .from('site_settings')
      .update({
        site_name: body.siteName,
        tagline: body.tagline,
        contact_email: body.email,
        contact_phone: body.phone,
        office_address: body.address,
        social_links: {
          facebook: body.facebookUrl || '',
          instagram: body.instagramUrl || '',
          linkedin: body.linkedinUrl || '',
          whatsapp: body.whatsappNumber || ''
        }
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/cms/settings error:', error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
  }
}
