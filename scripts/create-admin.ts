import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  const email = 'admin@transiteducation.com'
  const password = 'TransitAdmin_2024!_Secure'

  console.log(`Attempting to create admin user: ${email}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Admin user already exists.')
    } else {
      console.error('Error creating admin user:', error.message)
    }
  } else {
    console.log('Admin user created successfully:', data.user?.id)
  }
}

createAdmin()
