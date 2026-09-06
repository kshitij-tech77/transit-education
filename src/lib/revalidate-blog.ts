import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Invalidate every cache entry that can surface a blog post.
 *
 * The public blog routes are ISR (`export const revalidate = 300`) and read
 * their data through `unstable_cache(..., { tags: ['blog-posts'] })`, so a
 * freshly published/edited post otherwise stays invisible — or a stale 404
 * sticks around — for up to 5 minutes. CMS mutations must show up on the next
 * request, so we expire immediately (`{ expire: 0 }`) rather than using
 * stale-while-revalidate.
 */
export function revalidateBlog(slug?: string) {
  revalidateTag('blog-posts', { expire: 0 });
  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath('/sitemap.xml');
}
