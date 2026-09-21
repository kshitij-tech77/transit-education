import { SITE_URL } from "@/lib/site-url";
import { getIndexablePosts } from "@/lib/blog-posts";

// Regenerated at most hourly, and immediately when the CMS changes a post.
export const revalidate = 3600;

const FEED_TITLE = "Transit Education Blog";
const FEED_DESCRIPTION =
  "Study abroad guides, student visa tips, IELTS preparation and scholarship news from Transit Education, Nepal.";
const MAX_ITEMS = 50;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

function rfc822(iso: string | null): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : new Date(time).toUTCString();
}

export async function GET() {
  const posts = await getIndexablePosts(MAX_ITEMS);
  const newest = rfc822(posts[0]?.lastModified ?? null);

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = rfc822(post.publishDate);
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <description>${escapeXml(post.description)}</description>`,
        ...(post.category ? [`      <category>${escapeXml(post.category)}</category>`] : []),
        ...(pubDate ? [`      <pubDate>${pubDate}</pubDate>`] : []),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${newest ? `    <lastBuildDate>${newest}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
