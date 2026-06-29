import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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
  const { pathname } = request.nextUrl

  const isCmsRoute = pathname.startsWith('/cms')
  const isCmsLoginRoute = pathname.startsWith('/cms/login')
  const isCmsApiRoute = pathname.startsWith('/api/cms')

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
  matcher: ['/cms/:path*', '/api/cms/:path*']
}
