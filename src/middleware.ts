import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
  
  if (pathname.startsWith('/cms')) {
    const allCookies = request.cookies.getAll().map(c => c.name).join(', ')
    console.log(`Middleware path: ${pathname} | User: ${user?.email || 'NONE'} | Cookies: ${allCookies}`)
  }

  const isCmsRoute = pathname.startsWith('/cms')
  const isCmsLoginRoute = pathname.startsWith('/cms/login')
  const isCmsApiRoute = pathname.startsWith('/api/cms')

  // Case 1: User is logged in and tries to access login page -> Redirect to dashboard
  if (user && isCmsLoginRoute) {
    console.log(`Middleware: Authenticated user ${user.email} accessing login. Redirecting to /cms`)
    return NextResponse.redirect(new URL('/cms', request.url))
  }

  // Case 2: User is NOT logged in and tries to access protected CMS routes
  if (!user && (isCmsRoute || isCmsApiRoute) && !isCmsLoginRoute) {
    // Allow public access to specific frontend API routes
    const isPublicGet = isCmsApiRoute && 
      request.method === 'GET' && 
      ['/api/cms/success-stories', '/api/cms/countries', '/api/cms/settings'].includes(pathname)

    const isPublicLeadPost = isCmsApiRoute && pathname === '/api/cms/students' && request.method === 'POST'

    if (!isPublicGet && !isPublicLeadPost) {
      if (isCmsApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      console.log('Middleware: Unauthenticated access to protected route. Redirecting to /cms/login')
      return NextResponse.redirect(new URL('/cms/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/cms/:path*', '/api/cms/:path*']
}
