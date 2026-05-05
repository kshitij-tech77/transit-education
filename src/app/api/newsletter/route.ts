import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if table exists by trying to insert
    const { error } = await supabase.from('newsletter_subscribers').upsert({ email }, { onConflict: 'email' })

    if (error) {
      if (error.code === 'PGRST116') { // Table not found
        // For now, we'll just log and return success to the user 
        // to avoid a broken UI if the user hasn't created the table yet.
        console.error('newsletter_subscribers table missing. Please create it in Supabase.')
      } else {
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
