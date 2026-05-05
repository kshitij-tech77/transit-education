import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupProfiles() {
  console.log('Setting up profiles table...')

  // Create profiles table if it doesn't exist (via RPC or just assume we can insert if it exists)
  // Since we can't easily run arbitrary SQL via the client without an RPC, 
  // I'll try to insert and see if it fails.
  // Actually, I'll provide the SQL for the user to run in the dashboard as well, 
  // but I'll try to use the client to see if the table exists.

  const { data: adminUser, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) {
    console.error('Error listing users:', userError.message)
    return
  }

  const admin = adminUser.users.find(u => u.email === 'admin@transiteducation.com')
  if (!admin) {
    console.error('Admin user not found. Run create_admin.ts first.')
    return
  }

  console.log(`Found admin user ID: ${admin.id}`)

  // Try to insert into profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: admin.id,
      email: admin.email,
      role: 'admin'
    })

  if (profileError) {
    console.error('Error creating admin profile:', profileError.message)
    console.log('Note: You may need to create the "profiles" table in the Supabase SQL Editor first:')
    console.log(`
      create table if not exists public.profiles (
        id uuid references auth.users on delete cascade primary key,
        email text,
        role text default 'user',
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
      alter table public.profiles enable row level security;
    `)
  } else {
    console.log('Admin profile created successfully.')
  }
}

setupProfiles()
