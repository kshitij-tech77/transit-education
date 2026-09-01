import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site-url";
import { toBranchSlug } from "@/lib/branch-slug";

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

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/admission-counselling", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services/student-visa-service", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services/test-preparation", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services/scholarships-assistance", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services/sop-writing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/courses/language-training", priority: 0.6, changeFrequency: "monthly" },
  { path: "/courses/test-preparation", priority: 0.6, changeFrequency: "monthly" },
  { path: "/locations", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tools", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tools/cost-calculator", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tools/gpa-converter", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tools/ielts-band-calculator", priority: 0.6, changeFrequency: "monthly" },
  { path: "/resources", priority: 0.6, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/team", priority: 0.5, changeFrequency: "monthly" },
  { path: "/accreditation", priority: 0.6, changeFrequency: "monthly" },
  { path: "/compliance", priority: 0.6, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.4, changeFrequency: "weekly" },
  { path: "/franchise", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/refund", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: countries }, { data: branches }, { data: posts }] = await Promise.all([
    supabase.from("countries").select("id, updated_at").eq("status", "LIVE"),
    supabase.from("branches").select("name"),
    supabase.from("blog_posts").select("slug, publish_date, last_reviewed_at").eq("status", "published"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const locationEntries: MetadataRoute.Sitemap = (branches ?? []).map((branch) => ({
    url: `${SITE_URL}/locations/${toBranchSlug(branch.name)}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const countryEntries: MetadataRoute.Sitemap = HAND_AUTHORED_COUNTRY_PAGES.map((id) => ({
    url: `${SITE_URL}/study-abroad/${id}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));
  for (const country of countries ?? []) {
    if ((HAND_AUTHORED_COUNTRY_PAGES as readonly string[]).includes(country.id)) continue;
    countryEntries.push({
      url: `${SITE_URL}/study-abroad/${country.id}`,
      lastModified: country.updated_at ?? undefined,
      changeFrequency: "weekly",
      priority: 0.9,
    });
    for (const subpage of COUNTRY_SUBPAGES) {
      countryEntries.push({
        url: `${SITE_URL}/study-abroad/${country.id}/${subpage}`,
        lastModified: country.updated_at ?? undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  const blogEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.last_reviewed_at ?? post.publish_date ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...countryEntries, ...locationEntries, ...blogEntries];
}
