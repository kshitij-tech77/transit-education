-- Adds CMS-manageable visibility to team_members (replacing the hardcoded
-- HIDDEN_MEMBERS name-filter in src/app/(frontend)/team/page.tsx) and
-- introduces a generic "pages" table so editors can publish new simple
-- content pages (title + rich-text body) without a code deploy.

ALTER TABLE "public"."team_members"
  ADD COLUMN IF NOT EXISTS "is_visible" boolean NOT NULL DEFAULT true;

-- Preserve the one member currently hidden via the old hardcoded filter.
UPDATE "public"."team_members" SET "is_visible" = false WHERE "name" = 'Kshitiz';

CREATE TABLE IF NOT EXISTS "public"."pages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" DEFAULT '' NOT NULL,
    "meta_description" "text",
    "status" "text" DEFAULT 'DRAFT' NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "pages_status_check" CHECK (("status" = ANY (ARRAY['LIVE'::"text", 'DRAFT'::"text"])))
);

ALTER TABLE "public"."pages" OWNER TO "postgres";

ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_slug_key" UNIQUE ("slug");

ALTER TABLE "public"."pages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages: public can read live" ON "public"."pages" FOR SELECT TO "anon" USING (("status" = 'LIVE'::"text"));

CREATE POLICY "pages: authenticated can read all" ON "public"."pages" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "pages: editors can create" ON "public"."pages" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "pages: editors can update" ON "public"."pages" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));

CREATE POLICY "pages: only admins can delete" ON "public"."pages" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));

GRANT ALL ON TABLE "public"."pages" TO "anon";
GRANT ALL ON TABLE "public"."pages" TO "authenticated";
GRANT ALL ON TABLE "public"."pages" TO "service_role";
