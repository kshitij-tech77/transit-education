import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Supabase's magic-link email points here (see emailRedirectTo in
// portal/login/page.tsx). Exchanges the PKCE code for a session cookie,
// then hands off to `next` — the actual login/registration UI never runs
// otherwise, since GoTrue would just redirect straight to the Site URL.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/portal/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/portal/login?error=auth_callback_failed`);
}
