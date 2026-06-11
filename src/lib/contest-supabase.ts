// Dedicated Supabase service-role client for contest API routes.
// Separate from supabase-admin.ts to keep contest operations isolated.

import { createClient } from '@supabase/supabase-js';

export const contestDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);
