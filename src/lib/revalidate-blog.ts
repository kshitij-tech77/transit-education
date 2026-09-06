import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Invalidate the caches that still hold blog data after a CMS publish / edit /
 * delete.
 *
 * The public `/blog` and `/blog/[slug]` pages are now `force-dynamic` (read
 * fresh from Supabase on every request), so they need no invalidation. What
 * remains cached:
 *  - the homepage "Latest Blog" strip — `unstable_cache(tags: ['blog-posts'])`
 *  - `/sitemap.xml` — time-based ISR
 */
export function revalidateBlog() {
  revalidateTag('blog-posts', { expire: 0 });
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
}
