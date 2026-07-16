/**
 * Server-only helpers for CMS loyalty routes. auth.users isn't exposed via
 * PostgREST, so member emails have to be resolved through the admin API
 * rather than a normal `.from('loyalty_members').select(...)` join.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function getUserEmailMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    for (const u of data.users) {
      if (u.email) map.set(u.id, u.email);
    }
    if (data.users.length < perPage) break;
    page++;
  }

  return map;
}
