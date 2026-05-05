import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupUniversities() {
  console.log('Setting up universities table...')

  // Note: We can't run SQL directly here to create tables if they don't exist
  // unless we have an RPC or use the Dashboard. 
  // I will assume the table needs to be created or I'll try to insert and see.
  
  const universityData = [
    { name: 'University of Toronto', country: 'Canada', website_url: 'https://utoronto.ca' },
    { name: 'University of Melbourne', country: 'Australia', website_url: 'https://unimelb.edu.au' },
    { name: 'University of Oxford', country: 'UK', website_url: 'https://ox.ac.uk' },
    { name: 'Harvard University', country: 'USA', website_url: 'https://harvard.edu' },
    { name: 'University of British Columbia', country: 'Canada', website_url: 'https://ubc.ca' },
    { name: 'University of Sydney', country: 'Australia', website_url: 'https://sydney.edu.au' },
  ];

  const { error } = await supabase.from('universities').upsert(
    universityData.map(u => ({
      ...u,
      logo_url: `https://logo.clearbit.com/${new URL(u.website_url).hostname}`,
      is_featured: true
    })),
    { onConflict: 'name' }
  )

  if (error) {
    console.error('Error seeding universities:', error.message)
    console.log('SQL to create table if it does not exist:')
    console.log(`
      create table if not exists public.universities (
        id uuid default gen_random_uuid() primary key,
        name text unique not null,
        logo_url text,
        country text,
        website_url text,
        is_featured boolean default false,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `)
  } else {
    console.log('Universities seeded successfully.')
  }
}

setupUniversities()
