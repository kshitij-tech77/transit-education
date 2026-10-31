export interface HomeBlogCard {
  slug: string;
  title: string;
  category: string | null;
  publishDate: string | null;
  featuredImage: string | null;
  authorName: string | null;
  excerpt: string;
}

interface HomeBlogRow {
  slug: string;
  title: string;
  category?: string | null;
  publish_date?: string | null;
  featured_image?: string | null;
  authorName?: string | null;
  author_name?: string | null;
  body?: string | null;
}

// Keep the existing card excerpt, but never serialize full articles or unused
// database fields into the homepage's Data Cache or client-component props.
export function toHomeBlogCard(post: HomeBlogRow): HomeBlogCard {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category ?? null,
    publishDate: post.publish_date ?? null,
    featuredImage: post.featured_image ?? null,
    authorName: post.authorName || post.author_name || null,
    excerpt: (post.body ?? '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/[*_`~]/g, '')
      .slice(0, 120),
  };
}
