-- Ensures every CMS-capable auth user has a `profiles` row with a non-null
-- role (audit finding: the CMS header showed the "USER" fallback and
-- get_my_role() returned NULL because the user had no profiles row, which
-- also makes requireCmsAuth 403 every /api/cms/* request).
--
-- Not applied — SQL only, to be run manually in the Supabase SQL editor.
--
-- Backfill policy (chosen deliberately — do NOT blanket-grant 'admin'):
--   * Emails listed in `admin_emails` below            -> 'admin'
--   * Every other auth user with no profiles row       -> 'editor'
--   * Existing profiles rows with a NULL role          -> 'editor'
-- Any authenticated Supabase user (including future loyalty-portal members)
-- can be profile-less, so a blanket 'admin' backfill would hand them the CMS.
--
-- AFTER RUNNING:
--   1. Verify the admins are who you expect:
--        SELECT p.id, p.email, p.role
--        FROM profiles p
--        WHERE p.role = 'admin';
--   2. Verify no one is left role-less:
--        SELECT u.email
--        FROM auth.users u
--        LEFT JOIN profiles p ON p.id = u.id
--        WHERE p.id IS NULL OR p.role IS NULL;
--   3. Promote/downgrade individuals as needed:
--        UPDATE profiles SET role = 'admin'  WHERE email = 'someone@example.com';
--        UPDATE profiles SET role = 'editor' WHERE email = 'someone@example.com';
--   4. If a profile-less user should have NO CMS access at all (e.g. a
--      loyalty member), just delete the row this migration created for them:
--        DELETE FROM profiles WHERE email = 'member@example.com';

WITH admin_emails (email) AS (
  VALUES ('skatt008@ucr.edu'),
         ('admin@transiteducation.com')
  -- add more admin emails here, one ('...') per line, comma-separated
)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  CASE
    WHEN lower(u.email) IN (SELECT lower(email) FROM admin_emails) THEN 'admin'
    ELSE 'editor'
  END::public.user_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Repair existing rows that somehow have a NULL role.
UPDATE public.profiles
SET role = 'editor'
WHERE role IS NULL;
