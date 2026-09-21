import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Invalidate the caches that still hold blog data after a CMS publish / edit /
 * unpublish / delete.
 *
 * The public `/blog` and `/blog/[slug]` pages are `force-dynamic` (read fresh
 * from Supabase on every request), so revalidating them is only a safety net.
 * What genuinely stays cached:
 *  - the homepage "Latest Blog" strip: `unstable_cache(tags: ['blog-posts'])`
 *  - the crawler-facing feeds, which are time-based ISR: `/sitemap.xml`,
 *    `/rss.xml` and `/llms.txt`. Refreshing them here is what makes a new post
 *    show up in the sitemap immediately instead of after the fallback window.
 */
export function revalidateBlog(slug?: string) {
  revalidateTag('blog-posts', { expire: 0 });
  revalidatePath('/');
  revalidatePath('/blog');
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/rss.xml');
  revalidatePath('/llms.txt');
}
