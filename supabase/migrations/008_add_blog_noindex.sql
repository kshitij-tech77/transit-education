-- Adds per-post robots/noindex control (audit finding: no way to mark a
-- draft or thin-content post noindex without affecting the whole site).
-- Not applied — SQL only, to be run manually in the Supabase dashboard.

ALTER TABLE "public"."blog_posts"
  ADD COLUMN IF NOT EXISTS "noindex" boolean NOT NULL DEFAULT false;
