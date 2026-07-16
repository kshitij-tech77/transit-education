


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."content_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE "public"."content_status" OWNER TO "postgres";


CREATE TYPE "public"."country_status" AS ENUM (
    'LIVE',
    'DRAFT'
);


ALTER TYPE "public"."country_status" OWNER TO "postgres";


CREATE TYPE "public"."student_status" AS ENUM (
    'PENDING',
    'IN PROGRESS',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE "public"."student_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'editor'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."loyalty_apply_transaction"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update loyalty_members
    set points_balance = points_balance + new.points
    where id = new.member_id;
  return new;
end;
$$;


ALTER FUNCTION "public"."loyalty_apply_transaction"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."loyalty_redemptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "points_spent" integer NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "loyalty_redemptions_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'FULFILLED'::"text", 'REJECTED'::"text"])))
);


ALTER TABLE "public"."loyalty_redemptions" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."loyalty_redeem"("p_reward_id" "uuid") RETURNS "public"."loyalty_redemptions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_reward     loyalty_rewards;
  v_balance    integer;
  v_redemption loyalty_redemptions;
  v_member_id  uuid := auth.uid();
begin
  if v_member_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_reward from loyalty_rewards where id = p_reward_id and active = true for update;
  if not found then
    raise exception 'Reward not found or inactive';
  end if;

  if v_reward.stock is not null and v_reward.stock <= 0 then
    raise exception 'Reward out of stock';
  end if;

  select points_balance into v_balance from loyalty_members where id = v_member_id for update;
  if v_balance is null or v_balance < v_reward.points_cost then
    raise exception 'Insufficient points balance';
  end if;

  insert into loyalty_redemptions (member_id, reward_id, points_spent, status)
    values (v_member_id, p_reward_id, v_reward.points_cost, 'PENDING')
    returning * into v_redemption;

  insert into loyalty_transactions (member_id, type, points, reason_code)
    values (v_member_id, 'REDEEM', -v_reward.points_cost, 'REDEMPTION');

  if v_reward.stock is not null then
    update loyalty_rewards set stock = stock - 1 where id = p_reward_id;
  end if;

  return v_redemption;
end;
$$;


ALTER FUNCTION "public"."loyalty_redeem"("p_reward_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_match_statuses"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- upcoming → open: 30 minutes before kickoff
  UPDATE matches
  SET status = 'open'
  WHERE status = 'upcoming'
    AND kickoff_at <= now() + interval '30 minutes'
    AND kickoff_at > now();

  -- open → locked: at locks_at time
  UPDATE matches
  SET status = 'locked'
  WHERE status = 'open'
    AND locks_at <= now();
END;
$$;


ALTER FUNCTION "public"."update_match_statuses"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."authors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "credential" "text",
    "bio" "text",
    "photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."authors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "body" "text" NOT NULL,
    "category" "text" DEFAULT 'Study Abroad'::"text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "status" "public"."content_status" DEFAULT 'draft'::"public"."content_status",
    "publish_date" timestamp with time zone,
    "featured_image" "text",
    "meta_title" "text",
    "meta_description" "text",
    "focus_keyword" "text",
    "canonical_url" "text",
    "author_id" "uuid",
    "last_reviewed_at" timestamp with time zone,
    "sources" "text"[] DEFAULT '{}'::"text"[],
    "primary_question" "text",
    "answer_summary" "text",
    "faq_schema" "jsonb" DEFAULT '[]'::"jsonb",
    "reading_time" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "secondary_keywords" "text"[] DEFAULT '{}'::"text"[],
    "og_description" "text"
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."branches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "phone" "text",
    "manager_name" "text",
    "working_hours" "text",
    "student_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "location_slug" "text"
);


ALTER TABLE "public"."branches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" "text" NOT NULL,
    "code" character(2) NOT NULL,
    "flag" "text",
    "name" "text" NOT NULL,
    "status" "public"."country_status" DEFAULT 'DRAFT'::"public"."country_status",
    "hero_title" "text",
    "why_study" "text",
    "intakes" "text",
    "visa_time" "text",
    "tuition_range" "text",
    "top_universities" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "entry_requirements" "jsonb" DEFAULT '{"pg": [], "ug": []}'::"jsonb",
    "visa_process" "jsonb" DEFAULT '[]'::"jsonb",
    "major_intakes_description" "text",
    "required_documents" "text"[] DEFAULT '{}'::"text"[],
    "meta_title" "text",
    "meta_description" "text",
    "tagline" "text",
    "feature1_title" "text",
    "feature1_desc" "text",
    "feature2_title" "text",
    "feature2_desc" "text",
    "visa_section_title" "text",
    "cost_of_living" "jsonb",
    "scholarship_data" "jsonb",
    "city_guides" "jsonb",
    "visa_extended" "jsonb",
    "university_list" "jsonb"
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "event_date" timestamp with time zone NOT NULL,
    "description" "text",
    "location" "text" DEFAULT 'Online'::"text",
    "registration_link" "text",
    "is_published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "banner_image" "text"
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faqs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "category" "text",
    "page_path" "text" DEFAULT 'Homepage'::"text",
    "is_featured" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "status" "public"."content_status" DEFAULT 'published'::"public"."content_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "country_slug" character varying(50),
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."franchise_inquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "city" "text" NOT NULL,
    "business_background" "text",
    "message" "text",
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."franchise_inquiries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."heartbeat" (
    "id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."heartbeat" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."heartbeat_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."heartbeat_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."heartbeat_id_seq" OWNED BY "public"."heartbeat"."id";



CREATE TABLE IF NOT EXISTS "public"."job_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "position" "text" NOT NULL,
    "cover_letter" "text",
    "cv_url" "text",
    "job_opening_id" "uuid",
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_openings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "department" "text",
    "location" "text" DEFAULT 'Kathmandu'::"text",
    "type" "text" DEFAULT 'Full-time'::"text",
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_openings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."login_attempts" (
    "key" "text" NOT NULL,
    "count" integer DEFAULT 0,
    "locked_until" timestamp with time zone
);


ALTER TABLE "public"."login_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loyalty_members" (
    "id" "uuid" NOT NULL,
    "referral_code" "text" NOT NULL,
    "referred_by_member_id" "uuid",
    "points_balance" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."loyalty_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loyalty_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "points_cost" integer NOT NULL,
    "stock" integer,
    "active" boolean DEFAULT true NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "loyalty_rewards_points_cost_check" CHECK (("points_cost" > 0))
);


ALTER TABLE "public"."loyalty_rewards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loyalty_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "points" integer NOT NULL,
    "reason_code" "text" NOT NULL,
    "related_member_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "loyalty_transactions_reason_code_check" CHECK (("reason_code" = ANY (ARRAY['REFERRAL_SIGNUP'::"text", 'REDEMPTION'::"text"]))),
    CONSTRAINT "loyalty_transactions_type_check" CHECK (("type" = ANY (ARRAY['EARN'::"text", 'REDEEM'::"text"])))
);


ALTER TABLE "public"."loyalty_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "subscribed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."otp_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "code" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."otp_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "public"."user_role" DEFAULT 'editor'::"public"."user_role",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "category" "text" NOT NULL,
    "type" "text" NOT NULL,
    "url" "text" NOT NULL,
    "file_size" "text",
    "status" "text" DEFAULT 'published'::"text",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" integer NOT NULL,
    "site_name" "text" DEFAULT 'Transit Education'::"text",
    "tagline" "text",
    "contact_email" "text",
    "contact_phone" "text",
    "office_address" "text",
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "seo_config" "jsonb" DEFAULT '{}'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "site_settings_id_check" CHECK (("id" = 1))
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "branch_id" "uuid",
    "interested_country_id" "text",
    "counselor_name" "text",
    "status" "public"."student_status" DEFAULT 'PENDING'::"public"."student_status",
    "notes" "text",
    "applied_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."success_stories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "student_name" "text" NOT NULL,
    "country_id" "text",
    "university" "text",
    "year" "text",
    "course" "text",
    "approval_image_url" "text",
    "is_featured" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."success_stories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "branch_id" "uuid",
    "photo_url" "text",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "student_name" "text" NOT NULL,
    "course" "text",
    "university" "text",
    "country_id" "text",
    "body" "text" NOT NULL,
    "rating" integer,
    "photo_url" "text",
    "is_featured" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "testimonials_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


ALTER TABLE ONLY "public"."heartbeat" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."heartbeat_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."authors"
    ADD CONSTRAINT "authors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."franchise_inquiries"
    ADD CONSTRAINT "franchise_inquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."heartbeat"
    ADD CONSTRAINT "heartbeat_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_openings"
    ADD CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."login_attempts"
    ADD CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."loyalty_members"
    ADD CONSTRAINT "loyalty_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_members"
    ADD CONSTRAINT "loyalty_members_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."loyalty_redemptions"
    ADD CONSTRAINT "loyalty_redemptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_rewards"
    ADD CONSTRAINT "loyalty_rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."otp_codes"
    ADD CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."success_stories"
    ADD CONSTRAINT "success_stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_blog_posts_publish_date" ON "public"."blog_posts" USING "btree" ("publish_date" DESC);



CREATE INDEX "idx_blog_posts_status" ON "public"."blog_posts" USING "btree" ("status");



CREATE INDEX "idx_branches_location_slug" ON "public"."branches" USING "btree" ("location_slug");



CREATE INDEX "idx_loyalty_redemptions_member" ON "public"."loyalty_redemptions" USING "btree" ("member_id");



CREATE INDEX "idx_loyalty_transactions_member" ON "public"."loyalty_transactions" USING "btree" ("member_id");



CREATE INDEX "idx_otp_email" ON "public"."otp_codes" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "trg_loyalty_transaction_balance" AFTER INSERT ON "public"."loyalty_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."loyalty_apply_transaction"();



CREATE OR REPLACE TRIGGER "update_blog_posts_modtime" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_countries_modtime" BEFORE UPDATE ON "public"."countries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_faqs_modtime" BEFORE UPDATE ON "public"."faqs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_students_modtime" BEFORE UPDATE ON "public"."students" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id");



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_job_opening_id_fkey" FOREIGN KEY ("job_opening_id") REFERENCES "public"."job_openings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."loyalty_members"
    ADD CONSTRAINT "loyalty_members_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loyalty_members"
    ADD CONSTRAINT "loyalty_members_referred_by_member_id_fkey" FOREIGN KEY ("referred_by_member_id") REFERENCES "public"."loyalty_members"("id");



ALTER TABLE ONLY "public"."loyalty_redemptions"
    ADD CONSTRAINT "loyalty_redemptions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."loyalty_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loyalty_redemptions"
    ADD CONSTRAINT "loyalty_redemptions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."loyalty_rewards"("id");



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."loyalty_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_related_member_id_fkey" FOREIGN KEY ("related_member_id") REFERENCES "public"."loyalty_members"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_interested_country_id_fkey" FOREIGN KEY ("interested_country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."success_stories"
    ADD CONSTRAINT "success_stories_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id");



CREATE POLICY "Admins can read all, users can read own" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR ("public"."get_my_role"() = 'admin'::"text")));



CREATE POLICY "Allow public read access" ON "public"."heartbeat" FOR SELECT USING (true);



CREATE POLICY "Allow public read access for resources" ON "public"."resources" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Anyone can insert franchise_inquiries" ON "public"."franchise_inquiries" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read job_openings" ON "public"."job_openings" FOR SELECT USING (true);



CREATE POLICY "Anyone can read published events" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can delete events" ON "public"."events" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete franchise_inquiries" ON "public"."franchise_inquiries" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete job_openings" ON "public"."job_openings" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert events" ON "public"."events" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert job_openings" ON "public"."job_openings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can read franchise_inquiries" ON "public"."franchise_inquiries" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update events" ON "public"."events" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update franchise_inquiries" ON "public"."franchise_inquiries" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update job_openings" ON "public"."job_openings" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "anon_insert_newsletter" ON "public"."newsletter_subscribers" FOR INSERT TO "anon" WITH CHECK (true);



ALTER TABLE "public"."authors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authors: authenticated can read all" ON "public"."authors" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "authors: editors can create" ON "public"."authors" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "authors: editors can update" ON "public"."authors" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "authors: only admins can delete" ON "public"."authors" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "authors: public can read all" ON "public"."authors" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "blog_posts: editors can create" ON "public"."blog_posts" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "blog_posts: editors can read all" ON "public"."blog_posts" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "blog_posts: editors can update" ON "public"."blog_posts" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "blog_posts: only admins can delete" ON "public"."blog_posts" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "blog_posts: public can read published" ON "public"."blog_posts" FOR SELECT TO "anon" USING (("status" = 'published'::"public"."content_status"));



ALTER TABLE "public"."branches" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "branches: authenticated can read all" ON "public"."branches" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "branches: editors can update" ON "public"."branches" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "branches: only admins can create" ON "public"."branches" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "branches: only admins can delete" ON "public"."branches" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "branches: public can read all" ON "public"."branches" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "countries: editors can create" ON "public"."countries" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "countries: editors can read all" ON "public"."countries" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "countries: editors can update" ON "public"."countries" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "countries: only admins can delete" ON "public"."countries" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "countries: public can read live" ON "public"."countries" FOR SELECT TO "anon" USING (("status" = 'LIVE'::"public"."country_status"));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."faqs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "faqs: editors can create" ON "public"."faqs" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "faqs: editors can read all" ON "public"."faqs" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "faqs: editors can update" ON "public"."faqs" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "faqs: only admins can delete" ON "public"."faqs" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "faqs: public can read published" ON "public"."faqs" FOR SELECT TO "anon" USING (("status" = 'published'::"public"."content_status"));



ALTER TABLE "public"."franchise_inquiries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."heartbeat" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_openings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."login_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_redemptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "members select own" ON "public"."loyalty_members" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "newsletter_subscribers: only admins can delete" ON "public"."newsletter_subscribers" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "newsletter_subscribers: only admins can read" ON "public"."newsletter_subscribers" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



ALTER TABLE "public"."otp_codes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "otp_service_only" ON "public"."otp_codes" USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "redemptions select own" ON "public"."loyalty_redemptions" FOR SELECT USING (("auth"."uid"() = "member_id"));



ALTER TABLE "public"."resources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "resources: editors can create" ON "public"."resources" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "resources: editors can update" ON "public"."resources" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"]))) WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "resources: only admins can delete" ON "public"."resources" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "rewards select active" ON "public"."loyalty_rewards" FOR SELECT USING (("active" = true));



ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "site_settings: authenticated can read" ON "public"."site_settings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "site_settings: only admins can delete" ON "public"."site_settings" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "site_settings: only admins can insert" ON "public"."site_settings" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "site_settings: only admins can update" ON "public"."site_settings" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "site_settings: public can read" ON "public"."site_settings" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "students: anon can submit lead form" ON "public"."students" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "students: editors can read all" ON "public"."students" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "students: editors can update" ON "public"."students" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "students: only admins can delete" ON "public"."students" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



ALTER TABLE "public"."success_stories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "success_stories: authenticated can read all" ON "public"."success_stories" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "success_stories: editors can create" ON "public"."success_stories" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "success_stories: editors can update" ON "public"."success_stories" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "success_stories: only admins can delete" ON "public"."success_stories" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "success_stories: public can read all" ON "public"."success_stories" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_members: authenticated can read all" ON "public"."team_members" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "team_members: editors can create" ON "public"."team_members" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "team_members: editors can update" ON "public"."team_members" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "team_members: only admins can delete" ON "public"."team_members" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "team_members: public can read all" ON "public"."team_members" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "testimonials: authenticated can read all" ON "public"."testimonials" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "testimonials: editors can create" ON "public"."testimonials" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "testimonials: editors can update" ON "public"."testimonials" FOR UPDATE TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'editor'::"text"])));



CREATE POLICY "testimonials: only admins can delete" ON "public"."testimonials" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "testimonials: public can read all" ON "public"."testimonials" FOR SELECT TO "anon" USING (true);



CREATE POLICY "transactions select own" ON "public"."loyalty_transactions" FOR SELECT USING (("auth"."uid"() = "member_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."loyalty_apply_transaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."loyalty_apply_transaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."loyalty_apply_transaction"() TO "service_role";



GRANT ALL ON TABLE "public"."loyalty_redemptions" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_redemptions" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_redemptions" TO "service_role";



GRANT ALL ON FUNCTION "public"."loyalty_redeem"("p_reward_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."loyalty_redeem"("p_reward_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."loyalty_redeem"("p_reward_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_match_statuses"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_match_statuses"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_match_statuses"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."authors" TO "anon";
GRANT ALL ON TABLE "public"."authors" TO "authenticated";
GRANT ALL ON TABLE "public"."authors" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."branches" TO "anon";
GRANT ALL ON TABLE "public"."branches" TO "authenticated";
GRANT ALL ON TABLE "public"."branches" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."faqs" TO "anon";
GRANT ALL ON TABLE "public"."faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."faqs" TO "service_role";



GRANT ALL ON TABLE "public"."franchise_inquiries" TO "anon";
GRANT ALL ON TABLE "public"."franchise_inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."franchise_inquiries" TO "service_role";



GRANT ALL ON TABLE "public"."heartbeat" TO "anon";
GRANT ALL ON TABLE "public"."heartbeat" TO "authenticated";
GRANT ALL ON TABLE "public"."heartbeat" TO "service_role";



GRANT ALL ON SEQUENCE "public"."heartbeat_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."heartbeat_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."heartbeat_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."job_applications" TO "anon";
GRANT ALL ON TABLE "public"."job_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."job_applications" TO "service_role";



GRANT ALL ON TABLE "public"."job_openings" TO "anon";
GRANT ALL ON TABLE "public"."job_openings" TO "authenticated";
GRANT ALL ON TABLE "public"."job_openings" TO "service_role";



GRANT ALL ON TABLE "public"."login_attempts" TO "anon";
GRANT ALL ON TABLE "public"."login_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."login_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."loyalty_members" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_members" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_members" TO "service_role";



GRANT ALL ON TABLE "public"."loyalty_rewards" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_rewards" TO "service_role";



GRANT ALL ON TABLE "public"."loyalty_transactions" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."otp_codes" TO "anon";
GRANT ALL ON TABLE "public"."otp_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."otp_codes" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON TABLE "public"."success_stories" TO "anon";
GRANT ALL ON TABLE "public"."success_stories" TO "authenticated";
GRANT ALL ON TABLE "public"."success_stories" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials" TO "anon";
GRANT ALL ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































