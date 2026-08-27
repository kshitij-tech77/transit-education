-- Fixes two RLS gaps found in a security audit:
--
--   1. events, job_openings, and franchise_inquiries scoped their write
--      policies to `TO authenticated` only, with no role check. Any
--      authenticated Supabase user — including a loyalty program member,
--      not just CMS staff — could read, modify, or delete these records by
--      calling the API directly. Rescoped to get_my_role() IN
--      ('admin', 'editor'), matching the pattern already used for
--      blog_posts, team_members, pages, etc. Public SELECT on events and
--      job_openings is left open, since both are public-facing listings.
--
--   2. job_applications had RLS enabled with zero policies defined, which
--      defaults to deny-all — legitimate CMS admins couldn't read
--      applications either. Adds the same admin/editor-scoped policies,
--      plus an open public INSERT for the careers application form.

-- ── events ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can read published events" ON "public"."events";
DROP POLICY IF EXISTS "Authenticated users can insert events" ON "public"."events";
DROP POLICY IF EXISTS "Authenticated users can update events" ON "public"."events";
DROP POLICY IF EXISTS "Authenticated users can delete events" ON "public"."events";

CREATE POLICY "events: public can read all" ON "public"."events" FOR SELECT USING (true);

CREATE POLICY "events: editors can create" ON "public"."events" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "events: editors can update" ON "public"."events" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "events: only admins can delete" ON "public"."events" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));

-- ── job_openings ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can read job_openings" ON "public"."job_openings";
DROP POLICY IF EXISTS "Authenticated users can insert job_openings" ON "public"."job_openings";
DROP POLICY IF EXISTS "Authenticated users can update job_openings" ON "public"."job_openings";
DROP POLICY IF EXISTS "Authenticated users can delete job_openings" ON "public"."job_openings";

CREATE POLICY "job_openings: public can read all" ON "public"."job_openings" FOR SELECT USING (true);

CREATE POLICY "job_openings: editors can create" ON "public"."job_openings" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "job_openings: editors can update" ON "public"."job_openings" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "job_openings: only admins can delete" ON "public"."job_openings" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));

-- ── franchise_inquiries ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can insert franchise_inquiries" ON "public"."franchise_inquiries";
DROP POLICY IF EXISTS "Authenticated users can read franchise_inquiries" ON "public"."franchise_inquiries";
DROP POLICY IF EXISTS "Authenticated users can update franchise_inquiries" ON "public"."franchise_inquiries";
DROP POLICY IF EXISTS "Authenticated users can delete franchise_inquiries" ON "public"."franchise_inquiries";

CREATE POLICY "franchise_inquiries: anyone can submit" ON "public"."franchise_inquiries" FOR INSERT WITH CHECK (true);

CREATE POLICY "franchise_inquiries: editors can read all" ON "public"."franchise_inquiries" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "franchise_inquiries: editors can update" ON "public"."franchise_inquiries" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "franchise_inquiries: only admins can delete" ON "public"."franchise_inquiries" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));

-- ── job_applications ────────────────────────────────────────────────────
-- RLS was already enabled on this table with no policies at all (default
-- deny-all), so there's nothing to drop — just add the missing policies.

CREATE POLICY "job_applications: anyone can apply" ON "public"."job_applications" FOR INSERT WITH CHECK (true);

CREATE POLICY "job_applications: editors can read all" ON "public"."job_applications" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "job_applications: editors can update" ON "public"."job_applications" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "job_applications: only admins can delete" ON "public"."job_applications" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));
