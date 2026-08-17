-- Reverts the "pages" table introduced in 005_team_visibility_and_pages.sql.
-- Decided against a generic content-pages feature in favor of extending the
-- existing Country Pages template instead. team_members.is_visible (also
-- added in 005) is unaffected and stays.

DROP TABLE IF EXISTS "public"."pages";
