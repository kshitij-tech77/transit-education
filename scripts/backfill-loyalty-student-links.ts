/**
 * backfill-loyalty-student-links.ts
 *
 * One-time backfill for migration 006 (loyalty_members.student_id).
 *
 * loyalty_members has no email column of its own — member emails live only
 * in auth.users, which isn't exposed through plain PostgREST/SQL joins in
 * this project (see getUserEmailMap-style pagination below). So this
 * backfill has to run as a script that calls the Admin Auth API to resolve
 * emails, then matches them against students.email — it can't be done as
 * plain SQL in the migration itself.
 *
 * Matching rule: exactly one match only. If a member's email matches zero
 * students rows, or two or more, it's left unlinked for staff to resolve
 * manually via the CMS link-student endpoint. Guessing wrong on an
 * ambiguous match would credit a referral conversion bonus to the wrong
 * lead, so ambiguous cases are always skipped rather than guessed.
 *
 * Idempotent — only considers loyalty_members rows where student_id is
 * still null, so re-running after new members/students are added is safe
 * and won't touch already-linked rows.
 *
 * This script only sets student_id. It does NOT fire any conversion bonus
 * — bonus-awarding on link is handled by the CMS link-student endpoint's
 * code path, not duplicated here, so there's exactly one place that logic
 * lives.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *   npm run backfill-loyalty-links
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from
 * .env.local, same as the rest of the app.
 */

import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';

loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '[backfill-loyalty-student-links] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUserEmailMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    for (const u of data.users) {
      if (u.email) map.set(u.id, u.email.toLowerCase());
    }
    if (data.users.length < perPage) break;
    page++;
  }

  return map;
}

async function main() {
  console.log('[backfill-loyalty-student-links] Resolving member emails via Admin Auth API...');
  const emailByMemberId = await getUserEmailMap();

  console.log('[backfill-loyalty-student-links] Fetching unlinked loyalty_members...');
  const { data: unlinkedMembers, error: membersError } = await supabase
    .from('loyalty_members')
    .select('id')
    .is('student_id', null);
  if (membersError) throw membersError;

  console.log('[backfill-loyalty-student-links] Fetching students with an email...');
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, email')
    .not('email', 'is', null);
  if (studentsError) throw studentsError;

  // Group student ids by lowercased email so we can detect duplicates
  // (students.email has no unique constraint) and refuse to guess.
  const studentIdsByEmail = new Map<string, string[]>();
  for (const s of students) {
    if (!s.email) continue;
    const key = s.email.toLowerCase();
    const list = studentIdsByEmail.get(key) ?? [];
    list.push(s.id);
    studentIdsByEmail.set(key, list);
  }

  let linked = 0;
  let noEmail = 0;
  let noMatch = 0;
  let ambiguous = 0;

  for (const member of unlinkedMembers) {
    const email = emailByMemberId.get(member.id);
    if (!email) {
      noEmail++;
      continue;
    }

    const matches = studentIdsByEmail.get(email) ?? [];
    if (matches.length === 0) {
      noMatch++;
      continue;
    }
    if (matches.length > 1) {
      ambiguous++;
      console.warn(
        `[backfill-loyalty-student-links] Skipping member ${member.id} — ${matches.length} students share email "${email}". Link manually via CMS.`
      );
      continue;
    }

    const { error: updateError } = await supabase
      .from('loyalty_members')
      .update({ student_id: matches[0] })
      .eq('id', member.id)
      .is('student_id', null); // idempotency guard against a concurrent run
    if (updateError) {
      console.error(`[backfill-loyalty-student-links] Failed to link member ${member.id}:`, updateError.message);
      continue;
    }
    linked++;
  }

  console.log('\n[backfill-loyalty-student-links] Done.');
  console.log(`  Linked:              ${linked}`);
  console.log(`  Skipped (no email):  ${noEmail}`);
  console.log(`  Skipped (no match):  ${noMatch}`);
  console.log(`  Skipped (ambiguous): ${ambiguous}`);
  console.log(`  Total considered:    ${unlinkedMembers.length}\n`);
}

main().catch(err => {
  console.error('[backfill-loyalty-student-links] Fatal error:', err);
  process.exit(1);
});
