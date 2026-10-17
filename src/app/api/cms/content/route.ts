import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCmsAuth } from '@/lib/cms-auth-guard';
import {
  applyContentUpdate,
  supabaseContentStore,
  type SupabaseLike,
} from '@/lib/cms-content-update';

/**
 * Field-level compare-and-set for allowlisted CMS text fields.
 * Body: { record, id, field, expected_value, new_value }. See cms-content-update.ts.
 * 200 updated · 400 invalid · 401 unauthorized · 403 not permitted · 404 not found ·
 * 409 stale or ambiguous · 413 too long · 500 internal (no details).
 */
export async function PATCH(req: Request) {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Expected a JSON object.' }, { status: 400 });
    }

    const supabase = await createClient();
    const store = supabaseContentStore(supabase as unknown as SupabaseLike);
    const outcome = await applyContentUpdate(store, body);
    return NextResponse.json(outcome.body, { status: outcome.status });
  } catch (error) {
    console.error('PATCH /api/cms/content error:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
