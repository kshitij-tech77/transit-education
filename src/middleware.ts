import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isCmsRoute = request.nextUrl.pathname.startsWith('/cms') && !request.nextUrl.pathname.startsWith('/cms/login')
  const isCmsApiRoute = request.nextUrl.pathname.startsWith('/api/cms')

  if (isCmsRoute || isCmsApiRoute) {
    // Allow public POST to /api/cms/students for lead generation
    const isPublicLeadPost = isCmsApiRoute && request.nextUrl.pathname === '/api/cms/students' && request.method === 'POST'

    if (!user && !isPublicLeadPost) {
      if (isCmsApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/cms/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/cms/:path*', '/api/cms/:path*'],
}
