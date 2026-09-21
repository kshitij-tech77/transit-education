import type { Metadata } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";
import { resolveMediaUrl } from "@/lib/media-url";
import {
  cleanDescription,
  latestDate,
  type BlogFaq,
  type BlogPostRow,
} from "@/lib/blog-posts";

export const SITE_NAME = "Transit Education";
export const ORG_ID = `${SITE_URL}/#organization`;
export const LOGO_URL = `${SITE_URL}/logo.png`;
export const RSS_URL = `${SITE_URL}/rss.xml`;

/** Google truncates titles at about 60 characters. */
const MAX_TITLE_LENGTH = 60;

export const INDEXABLE_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  "max-image-preview": "large",
  "max-snippet": -1,
  "max-video-preview": -1,
};

const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = { index: false, follow: false };

/** Admin Meta Title as written; the brand suffix is added only when it still fits. */
export function buildTitle(post: Pick<BlogPostRow, "title" | "meta_title">): string {
  const base = (post.meta_title || post.title).trim();
  const suffixed = `${base} | ${SITE_NAME}`;
  return suffixed.length <= MAX_TITLE_LENGTH ? suffixed : base;
}

/** Canonicals that still point at the pre-redirect apex host are moved onto SITE_URL. */
export function canonicalFor(post: Pick<BlogPostRow, "slug" | "canonical_url">): string {
  const custom = post.canonical_url?.trim();
  if (custom) {
    return custom.replace(/^https?:\/\/(?:www\.)?transiteducation\.com\.np(?=\/|$)/i, SITE_URL);
  }
  return absoluteUrl(`/blog/${post.slug}`);
}

/** Make any stored media reference an absolute URL on a host crawlers can fetch. */
export function absoluteMediaUrl(stored: string | null | undefined): string | null {
  const resolved = resolveMediaUrl(stored);
  if (!resolved) return null;
  if (resolved.startsWith("/")) return absoluteUrl(resolved);
  return resolved;
}

/**
 * A 1200x630 rendition for social cards and the first JSON-LD image. Cloudinary
 * can crop server-side, so the declared size is real; any other origin is
 * returned unchanged.
 */
export function socialImageUrl(stored: string | null | undefined): string {
  const url = absoluteMediaUrl(stored);
  if (!url) return LOGO_URL;
  if (/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url) && !/\/upload\/[^/]*w_1200/.test(url)) {
    return url.replace("/image/upload/", "/image/upload/c_fill,g_auto,w_1200,h_630,f_auto,q_auto/");
  }
  return url;
}

export interface NamedAuthor {
  name: string;
  credential: string;
  bio: string;
}

/**
 * The post's author as a real person, or null. An author row that just carries
 * the brand name (the CMS ships one as "Transit Education") is the Organization,
 * not a person, so it must not become a Person node, byline box or reviewer.
 */
export function namedAuthor(post: Pick<BlogPostRow, "authors">): NamedAuthor | null {
  const name = post.authors?.name?.trim();
  if (!name || name.toLowerCase().replace(/\s+/g, " ") === SITE_NAME.toLowerCase()) return null;
  return {
    name,
    credential: post.authors?.credential?.trim() ?? "",
    bio: post.authors?.bio?.trim() ?? "",
  };
}

export function isNoindex(post: Pick<BlogPostRow, "noindex">): boolean {
  return post.noindex === true;
}

export function validFaqs(items: BlogPostRow["faq_schema"]): BlogFaq[] {
  return (Array.isArray(items) ? items : []).filter(
    (item): item is BlogFaq =>
      !!item && typeof item.question === "string" && typeof item.answer === "string" &&
      item.question.trim() !== "" && item.answer.trim() !== ""
  );
}

export function validSources(items: BlogPostRow["sources"]): string[] {
  return (Array.isArray(items) ? items : [])
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((s) => /^https?:\/\/\S+$/i.test(s));
}

export function buildBlogMetadata(post: BlogPostRow): Metadata {
  const title = buildTitle(post);
  const description = cleanDescription(post.meta_description) ||
    "Read the latest updates from Nepal's most trusted study abroad consultancy.";
  const ogDescription = cleanDescription(post.og_description) || description;
  const canonical = canonicalFor(post);
  const image = socialImageUrl(post.featured_image);
  const shownTitle = (post.meta_title || post.title).trim();
  const author = namedAuthor(post)?.name;

  return {
    // `absolute` bypasses the layout's "%s | Transit Education" template so the
    // length rule in buildTitle is the only thing deciding the suffix.
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      types: { "application/rss+xml": [{ url: RSS_URL, title: `${SITE_NAME} Blog` }] },
    },
    robots: isNoindex(post) ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS,
    openGraph: {
      type: "article",
      title: shownTitle,
      description: ogDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      publishedTime: post.publish_date ?? undefined,
      modifiedTime: latestDate(post.updated_at, post.last_reviewed_at, post.publish_date) ?? undefined,
      section: post.category ?? undefined,
      tags: post.tags ?? undefined,
      authors: author ? [author] : undefined,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: shownTitle,
      description: ogDescription,
      images: [image],
    },
  };
}

/**
 * One JSON-LD @graph for a post: BlogPosting, WebPage, BreadcrumbList and,
 * only when the same Q&A is rendered on the page, FAQPage. The Organization
 * itself is emitted once by the root layout; here it is only referenced by
 * @id (with name and logo so publisher stays self-describing).
 */
export function buildBlogGraph(
  post: BlogPostRow,
  opts: { wordCount: number; faqs: BlogFaq[]; sources: string[] }
) {
  const url = canonicalFor(post);
  const articleId = `${url}#article`;
  const pageId = `${url}#webpage`;
  const crumbId = `${url}#breadcrumb`;
  const image = socialImageUrl(post.featured_image);
  const original = absoluteMediaUrl(post.featured_image);
  const images = original && original !== image ? [image, original] : [image];
  const modified = latestDate(post.updated_at, post.last_reviewed_at, post.publish_date);
  const named = namedAuthor(post);

  const person = named
    ? {
        "@type": "Person",
        name: named.name,
        ...(named.credential && { jobTitle: named.credential }),
        ...(named.bio && { description: named.bio }),
      }
    : null;
  const author = person ?? { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME };

  const keywords = [...new Set([...(post.tags ?? []), ...(post.secondary_keywords ?? [])])].filter(Boolean);
  const description = cleanDescription(post.meta_description);

  const article = {
    "@type": "BlogPosting",
    "@id": articleId,
    headline: post.title,
    ...(description && { description }),
    image: images,
    datePublished: post.publish_date ?? undefined,
    dateModified: modified ?? undefined,
    author,
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    mainEntityOfPage: { "@id": pageId },
    ...(post.category && { articleSection: post.category }),
    ...(keywords.length > 0 && { keywords }),
    wordCount: opts.wordCount,
    inLanguage: "en",
    ...(opts.sources.length > 0 && { citation: opts.sources }),
    ...(post.answer_summary?.trim() && {
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["[data-answer-summary]"] },
    }),
  };

  const webPage = {
    "@type": "WebPage",
    "@id": pageId,
    url,
    name: post.title,
    inLanguage: "en",
    primaryImageOfPage: { "@type": "ImageObject", url: image },
    breadcrumb: { "@id": crumbId },
    ...(post.last_reviewed_at && {
      lastReviewed: post.last_reviewed_at,
      ...(person && { reviewedBy: person }),
    }),
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": crumbId,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const faqPage =
    opts.faqs.length > 0
      ? {
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          url,
          mainEntity: opts.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return {
    "@context": "https://schema.org",
    "@graph": [article, webPage, breadcrumb, ...(faqPage ? [faqPage] : [])],
  };
}
