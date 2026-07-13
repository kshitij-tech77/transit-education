-- Links loyalty_members to students (the CRM/leads table), so referral
-- activity can eventually be judged against real business outcomes instead
-- of raw email signups.
--
-- This is a soft, optional link, not a gate:
--   - A loyalty member can exist with no matching student record (they
--     signed up but haven't become a lead yet).
--   - A student can exist with no loyalty member (enrolled through a
--     traditional/offline channel).
--
-- Deliberately NOT included here: any email-matching backfill SQL.
-- loyalty_members has no email column of its own (member emails live only
-- in auth.users, which isn't exposed through plain PostgREST/SQL joins in
-- this project — see getUserEmailMap() in src/lib/loyalty-admin.ts, which
-- resolves them via the Admin Auth API instead). So matching an existing
-- member to a student by email has to happen in application code that can
-- call that Admin API, not in a SQL migration. That backfill lives in
-- scripts/backfill-loyalty-student-links.ts and is run manually, once,
-- after this migration.

alter table loyalty_members
  add column if not exists student_id uuid references students(id) on delete set null;

create index if not exists idx_loyalty_members_student_id
  on loyalty_members (student_id);
