import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: Request) {
  try {
    const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
    if (!rateLimit(ip, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { email } = await request.json()

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from('newsletter_subscribers').upsert({ email }, { onConflict: 'email' })

    if (error) {
      if (error.code === 'PGRST116') {
        console.error('newsletter_subscribers table missing. Please create it in Supabase.')
      } else {
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
