import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { htmlToText } from "@/lib/blog-html";

/**
 * Server-side blog reads shared by the post page, sitemap, RSS and llms.txt.
 *
 * A "no such post" result (`null`) is kept strictly apart from a failed read
 * (throws). Treating a Supabase outage as "not found" would make every post
 * answer 404 during the outage and let Google drop them from the index, so
 * real errors surface as an error response that crawlers retry instead.
 */

export interface BlogAuthor {
  name: string | null;
  credential: string | null;
  bio: string | null;
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  category: string | null;
  tags: string[] | null;
  status: string;
  publish_date: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_description: string | null;
  canonical_url: string | null;
  last_reviewed_at: string | null;
  updated_at: string | null;
  sources: string[] | null;
  answer_summary: string | null;
  faq_schema: BlogFaq[] | null;
  reading_time: string | null;
  secondary_keywords: string[] | null;
  noindex: boolean | null;
  authors: BlogAuthor | null;
}

/** The fields the feed-style consumers (sitemap, RSS, llms.txt, related posts) need. */
export interface BlogPostSummary {
  slug: string;
  title: string;
  description: string;
  category: string | null;
  featuredImage: string | null;
  publishDate: string | null;
  lastModified: string | null;
}

const DETAIL_COLUMNS =
  "id, title, slug, body, category, tags, status, publish_date, featured_image, meta_title, meta_description, og_description, canonical_url, last_reviewed_at, updated_at, sources, answer_summary, faq_schema, reading_time, secondary_keywords, noindex, authors (name, credential, bio)";

const SUMMARY_COLUMNS =
  "slug, title, meta_description, category, featured_image, publish_date, updated_at, last_reviewed_at";

/** Admin descriptions sometimes carry markdown asterisks and a trailing ellipsis marker. */
export function cleanDescription(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/\s*\*[…\.]{1,3}\s*$/, "")
    .replace(/\*+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function latestDate(...dates: Array<string | null | undefined>): string | null {
  let best: { iso: string; time: number } | null = null;
  for (const iso of dates) {
    if (!iso) continue;
    const time = Date.parse(iso);
    if (Number.isNaN(time)) continue;
    if (!best || time > best.time) best = { iso, time };
  }
  return best?.iso ?? null;
}

type SummaryRow = {
  slug: string;
  title: string;
  meta_description: string | null;
  category: string | null;
  featured_image: string | null;
  publish_date: string | null;
  updated_at: string | null;
  last_reviewed_at: string | null;
};

function toSummary(row: SummaryRow): BlogPostSummary {
  return {
    slug: row.slug,
    title: row.title,
    description: cleanDescription(row.meta_description),
    category: row.category,
    featuredImage: row.featured_image,
    publishDate: row.publish_date,
    lastModified: latestDate(row.updated_at, row.last_reviewed_at, row.publish_date),
  };
}

/** One published post by slug. `null` only when it truly does not exist. */
export const getPublishedPost = cache(async (slug: string): Promise<BlogPostRow | null> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`blog_posts read failed for "${slug}": ${error.message}`);
  return (data as unknown as BlogPostRow | null) ?? null;
});

/**
 * Published posts that may be indexed (the admin "Hide from search engines"
 * flag is off), newest first. Used by sitemap, RSS and llms.txt.
 */
export async function getIndexablePosts(limit?: number): Promise<BlogPostSummary[]> {
  let query = supabase
    .from("blog_posts")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .or("noindex.is.null,noindex.eq.false")
    .order("publish_date", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new Error(`blog_posts list failed: ${error.message}`);
  return ((data ?? []) as SummaryRow[]).map(toSummary);
}

/**
 * Up to `count` other indexable posts, same category first. Only the light
 * summary columns are read, so a related-post list never drags full article
 * bodies into the render or the RSC payload.
 */
export async function getRelatedPosts(
  slug: string,
  category: string | null,
  count = 3
): Promise<BlogPostSummary[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .or("noindex.is.null,noindex.eq.false")
    .neq("slug", slug)
    .order("publish_date", { ascending: false })
    .limit(24);
  if (error) throw new Error(`related blog_posts read failed: ${error.message}`);
  const rows = ((data ?? []) as SummaryRow[]).map(toSummary);
  const sameCategory = category ? rows.filter((r) => r.category === category) : [];
  const others = rows.filter((r) => !sameCategory.includes(r));
  return [...sameCategory, ...others].slice(0, count);
}

/** Excerpt for a card or feed item: the admin description, else the first words of the body. */
export function excerptFor(summary: BlogPostSummary, body?: string | null): string {
  if (summary.description) return summary.description;
  return body ? htmlToText(body).slice(0, 160) : "";
}
