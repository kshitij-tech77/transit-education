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
  { path: "/study-abroad", priority: 0.9, changeFrequency: "weekly" },
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

  const countryEntries: MetadataRoute.Sitemap = [];
  for (const country of countries ?? []) {
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
