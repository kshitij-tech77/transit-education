import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// The only host production traffic should ever be served from. Hitting the
// app on any other host (the Vercel-assigned *.vercel.app production alias,
// in particular) builds up its own independent, cold image cache.
const CANONICAL_HOST = 'transiteducation.com.np'

export async function proxy(request: NextRequest) {
  // Redirect non-canonical hosts to the canonical domain before doing any
  // Supabase work. Gated on VERCEL_ENV === 'production' so this only ever
  // fires for the actual production deployment - preview deployments run
  // with VERCEL_ENV === 'preview' on their own per-deployment hostname and
  // are never touched by this check, and local dev has no VERCEL_ENV at all.
  // Reads the Host header directly rather than request.nextUrl.hostname -
  // under a self-hosted Node server (verified locally via `next start` + a
  // spoofed Host header), nextUrl.hostname reflects the server's own bind
  // address, not the incoming request's virtual host.
  const requestHostname = (request.headers.get('host') ?? '').split(':')[0]

  if (
    process.env.VERCEL_ENV === 'production' &&
    requestHostname !== CANONICAL_HOST
  ) {
    const url = request.nextUrl.clone()
    url.protocol = 'https'
    url.hostname = CANONICAL_HOST
    url.port = ''
    return NextResponse.redirect(url, 308)
  }

  const { pathname } = request.nextUrl
  const isCmsRoute = pathname.startsWith('/cms')
  const isCmsApiRoute = pathname.startsWith('/api/cms')
  const isPortalRoute = pathname === '/portal' || pathname.startsWith('/portal/')
  const isPortalApiRoute = pathname.startsWith('/api/portal')

  // Everything below this line is unchanged from before this file's matcher
  // was broadened - it's Supabase-auth-dependent CMS/portal gating, which
  // was previously this file's entire scope. Routes outside that scope
  // (public pages, /api/images, etc.) are now matched too, but only so the
  // host redirect above can run for them - they skip the Supabase
  // round-trip exactly as they always have.
  if (!isCmsRoute && !isCmsApiRoute && !isPortalRoute && !isPortalApiRoute) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isCmsLoginRoute = pathname.startsWith('/cms/login')

  // The loyalty portal (login, dashboard, rewards, referrals) merged into
  // main alongside an unrelated Supabase-egress caching fix, but hasn't
  // been reviewed/launched yet. Until PORTAL_ENABLED=true is set in Vercel,
  // block public access so nobody can self-register via the magic-link
  // flow - which would otherwise let any visitor obtain an authenticated
  // Supabase session (the CMS loyalty API routes only check for *any*
  // authenticated user, not an admin role, so this also closes off a
  // privilege-escalation path until that's fixed properly).
  if (process.env.PORTAL_ENABLED !== 'true' && (isPortalRoute || isPortalApiRoute)) {
    if (isPortalApiRoute) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && isCmsLoginRoute) {
    return NextResponse.redirect(new URL('/cms', request.url))
  }

  if (!user && (isCmsRoute || isCmsApiRoute) && !isCmsLoginRoute) {
    const isPublicGet = isCmsApiRoute &&
      request.method === 'GET' &&
      [
        '/api/cms/success-stories',
        '/api/cms/countries',
        '/api/cms/settings',
        '/api/cms/events',
        '/api/cms/job-openings',
      ].includes(pathname)

    const isPublicPost = isCmsApiRoute && request.method === 'POST' && [
      '/api/cms/students',
      '/api/cms/job-applications',
      '/api/cms/franchise-inquiries',
    ].includes(pathname)

    const isLoginRoute = pathname === '/api/cms/auth/login' && request.method === 'POST'

    if (!isPublicGet && !isPublicPost && !isLoginRoute) {
      if (isCmsApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/cms/login', request.url))
    }
  }

  return response
}

export const config = {
  // Broadened from ['/cms/:path*', '/api/cms/:path*', '/portal',
  // '/portal/:path*', '/api/portal/:path*'] so the canonical-host redirect
  // above runs site-wide. Excludes only hashed build assets and the
  // favicon, which have no Supabase egress or redirect relevance.
  matcher: ['/((?!_next/static|favicon.ico).*)'],
}
