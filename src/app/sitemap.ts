import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site-url";
import { toBranchSlug } from "@/lib/branch-slug";
import { getIndexablePosts, latestDate } from "@/lib/blog-posts";

// Rebuilt on demand by revalidateBlog() whenever a post changes; this is the
// fallback for edits made anywhere else (countries, branches).
export const revalidate = 300;

// `/study-abroad/[slug]/[subpage]` supports these four sub-guides for every
// live country (see study-abroad/[slug]/[subpage]/page.tsx) — even countries
// without bespoke content still render a valid "coming soon" page for these,
// so all four are always real, indexable URLs.
const COUNTRY_SUBPAGES = ["visa", "scholarships", "cost", "universities"] as const;

// These 4 of the 9 static study-abroad/<country> folders are fully
// hand-authored (no Supabase read, no draft/LIVE gate — see
// study-abroad/{italy,south-korea,ireland,new-zealand}/page.tsx), so they
// always render 200 regardless of whether a matching `countries` row exists.
// The other 5 static folders (canada/usa/uk/germany/australia) wrap
// CountryDestinationPage, which *does* read the DB and 404s if not LIVE —
// those are correctly covered by the dynamic `countries` query below instead.
// Next.js's static routes always win over the `[slug]` catch-all for an
// exact path match, so if a `countries` row with a matching id ever exists
// too, the static page (not the DB content) is what's actually served —
// hence excluding these ids from the dynamic query's output as well, to
// avoid ever listing the same URL twice.
const HAND_AUTHORED_COUNTRY_PAGES = ["italy", "south-korea", "ireland", "new-zealand"] as const;

const STATIC_PATHS = [
  "",
  "/about",
  "/services",
  "/services/admission-counselling",
  "/services/student-visa-service",
  "/services/test-preparation",
  "/services/scholarships-assistance",
  "/services/sop-writing",
  "/courses/language-training",
  "/courses/test-preparation",
  "/locations",
  "/tools",
  "/tools/cost-calculator",
  "/tools/gpa-converter",
  "/tools/ielts-band-calculator",
  "/resources",
  "/blog",
  "/team",
  "/accreditation",
  "/compliance",
  "/careers",
  "/franchise",
  "/contact",
  "/privacy",
  "/terms",
  "/refund",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: countries }, { data: branches }, posts] = await Promise.all([
    supabase.from("countries").select("id, updated_at").eq("status", "LIVE"),
    supabase.from("branches").select("name, updated_at"),
    // Published and not flagged "Hide from search engines"; a hidden post must
    // never be advertised to crawlers. A failed read throws so the previously
    // generated sitemap is kept instead of being replaced by one missing posts.
    getIndexablePosts(),
  ]);

  // Only pages with a real modification date get a <lastmod>. Google ignores
  // an inaccurate one, so hand-authored pages with no date source omit it.
  const latestPost = latestDate(...posts.map((post) => post.lastModified));

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    ...(path === "/blog" && latestPost && { lastModified: latestPost }),
  }));

  const locationEntries: MetadataRoute.Sitemap = (branches ?? []).map((branch) => ({
    url: `${SITE_URL}/locations/${toBranchSlug(branch.name)}`,
    lastModified: branch.updated_at ?? undefined,
  }));

  const countryEntries: MetadataRoute.Sitemap = HAND_AUTHORED_COUNTRY_PAGES.map((id) => ({
    url: `${SITE_URL}/study-abroad/${id}`,
  }));
  for (const country of countries ?? []) {
    if ((HAND_AUTHORED_COUNTRY_PAGES as readonly string[]).includes(country.id)) continue;
    countryEntries.push({
      url: `${SITE_URL}/study-abroad/${country.id}`,
      lastModified: country.updated_at ?? undefined,
    });
    for (const subpage of COUNTRY_SUBPAGES) {
      countryEntries.push({
        url: `${SITE_URL}/study-abroad/${country.id}/${subpage}`,
        lastModified: country.updated_at ?? undefined,
      });
    }
  }

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.lastModified ?? undefined,
  }));

  return [...staticEntries, ...countryEntries, ...locationEntries, ...blogEntries];
}
