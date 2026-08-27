import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-server';

const CMS_ROLES = new Set(['admin', 'editor']);

type CmsAuthResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse };

const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

/**
 * Route-level auth guard for /api/cms/* handlers. proxy.ts only checks that
 * *some* Supabase session exists (see its comment on the loyalty routes) —
 * it doesn't check role, and several handlers query with supabaseAdmin
 * (service role), which bypasses RLS entirely. This is the actual
 * admin/editor check those handlers need.
 */
export async function requireCmsAuth(): Promise<CmsAuthResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, error: unauthorized() };

  const { data: role } = await supabase.rpc('get_my_role');
  if (!role || !CMS_ROLES.has(role)) return { user: null, error: unauthorized() };

  return { user, error: null };
}
