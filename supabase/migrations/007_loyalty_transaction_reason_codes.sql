-- Widens loyalty_transactions_reason_code_check to include the reason codes
-- already used by shipped application code but never added to this
-- constraint by any prior migration:
--   - MILESTONE_COMPLETED, REFERRAL_MILESTONE_BONUS: inserted by the CMS
--     milestone-completion approval endpoint (src/app/api/cms/loyalty/
--     completions/[id]/route.ts), which predates this migration. Without
--     this widening, approving a milestone claim in the CMS fails with a
--     check-constraint violation.
--   - REFERRAL_CONVERSION: new in this pass — fired when a referred member
--     gets linked to a real student record (see migration 006 and
--     scripts/backfill-loyalty-student-links.ts).
--
-- Drop-and-recreate rather than a plain ADD, since the constraint already
-- exists under this name; safe to re-run (DROP IF EXISTS) and safe
-- regardless of exactly which reason codes production currently allows,
-- since the new list is a superset of every code in use anywhere in the
-- codebase.

alter table loyalty_transactions
  drop constraint if exists loyalty_transactions_reason_code_check;

alter table loyalty_transactions
  add constraint loyalty_transactions_reason_code_check
  check (reason_code = any (array[
    'REFERRAL_SIGNUP',
    'REDEMPTION',
    'MILESTONE_COMPLETED',
    'REFERRAL_MILESTONE_BONUS',
    'REFERRAL_CONVERSION'
  ]::text[]));
