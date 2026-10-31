import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from '../config';

/**
 * Service-role Supabase client for the RAG engine. It bypasses RLS, which is
 * how the RAG tables (no anon policies) are reached, so it must only ever be
 * used server-side. Lazy so importing this module never needs env vars.
 *
 * The RAG engine deliberately owns its client instead of importing
 * `src/lib/supabase-admin.ts`, so `rag/` has zero dependencies on the web app.
 */
let client: SupabaseClient | null = null;

export function getAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}
