import { createServerClient } from '@supabase/ssr'
import { AuthApiError } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkLoginLocked, clearLoginFailures, recordLoginFailure } from '@/lib/rate-limit'

const LIMIT = 5

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const body = await request.json().catch(() => null)
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()
  const { password } = body
  if (!email.includes('@') || password.length < 6) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
  }

  const ipKey = `ip:${ip}`
  const emailKey = `email:${email}`

  const [ipCheck, emailCheck] = await Promise.all([
    checkLoginLocked(ipKey),
    checkLoginLocked(emailKey),
  ])

  if (ipCheck.locked || emailCheck.locked) {
    const retryAfter = Math.max(ipCheck.retryAfter, emailCheck.retryAfter)
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again later.', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error instanceof AuthApiError && error.status === 400) {
      const [ipCount, emailCount] = await Promise.all([
        recordLoginFailure(ipKey),
        recordLoginFailure(emailKey),
      ])
      const attemptsLeft = Math.max(0, LIMIT - Math.max(ipCount, emailCount))
      return NextResponse.json(
        { error: 'Invalid email or password.', attemptsLeft },
        { status: 401 }
      )
    }
    return NextResponse.json({ error: 'Login failed. Try again.' }, { status: 500 })
  }

  await Promise.all([
    clearLoginFailures(ipKey),
    clearLoginFailures(emailKey),
  ])

  return NextResponse.json({ success: true })
}
