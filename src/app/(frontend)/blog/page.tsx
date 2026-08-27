import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import FAQAccordion from "@/components/shared/FAQAccordion";
import BlogFeed from "@/components/blog/BlogFeed";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Study Abroad Blog | Visa Tips, University Guides — Transit Education",
  description: "Expert articles on student visas, IELTS preparation, university admissions, and life abroad. Written by Transit Education's certified counsellors in Nepal.",
  alternates: { canonical: "https://transiteducation.com.np/blog" },
  openGraph: {
    title: "Study Abroad Blog | Transit Education Nepal",
    description: "Visa tips, scholarship news, IELTS guides, and destination insights from Nepal's most trusted study abroad consultancy.",
    url: "https://transiteducation.com.np/blog",
    type: "website",
  },
};

export const revalidate = 300;

// `category` (from searchParams) is passed as an argument, so it's
// automatically part of the cache key — each category filter gets its own
// cache entry, revalidated every 5 minutes.
const getCachedBlogPosts = unstable_cache(
  async (category?: string) => {
    const postsQuery = supabase
      .from('blog_posts')
      .select('*, authors (name)')
      .eq('status', 'published')
      .order('publish_date', { ascending: false });

    if (category) postsQuery.eq('category', category);

    const res = await postsQuery;
    return { data: res.data };
  },
  ['blog-posts-list'],
  { revalidate: 300, tags: ['blog-posts'] }
);

const getCachedBlogCategories = unstable_cache(
  async () => {
    const res = await supabase
      .from('blog_posts')
      .select('category')
      .eq('status', 'published');
    return { data: res.data };
  },
  ['blog-categories'],
  { revalidate: 300, tags: ['blog-posts'] }
);

const getCachedBlogPageFaqs = unstable_cache(
  async () => {
    const res = await supabase
      .from('faqs')
      .select('*')
      .eq('page_path', 'Blog')
      .eq('status', 'published')
      .order('display_order', { ascending: true });
    return { data: res.data };
  },
  ['blog-page-faqs'],
  { revalidate: 300, tags: ['faqs'] }
);

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: activeCategory } = await searchParams;

  const [{ data: posts }, { data: categoriesRaw }, { data: faqs }] = await Promise.all([
    getCachedBlogPosts(activeCategory),
    getCachedBlogCategories(),
    getCachedBlogPageFaqs(),
  ]);

  const blogPosts = posts?.map(p => ({
    ...p,
    publishDate: p.publish_date,
    featuredImage: p.featured_image,
    authorName: (p as any).authors?.name || "Transit Education",
    excerpt: p.body?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
  })) || [];

  /* Fix #19 — filter UNCATEGORIZED from public-facing category list */
  const categoryCounts = categoriesRaw?.reduce((acc: any, curr) => {
    const cat = curr.category?.trim();
    if (!cat || cat.toLowerCase() === "uncategorized") return acc;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {}) || {};

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({ name, count: count as number }));

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/03/micheile-henderson-ZVprbBmT8QA-unsplash-scaled.webp"
            alt="Transit Education Blog"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="container relative z-10 text-center">
          <SectionLabel className="text-white border-white/20 bg-white/10 mx-auto">Latest Updates</SectionLabel>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8">
            Stay Informed with <span className="text-brand">Transit Blog</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Expert insights, visa guides, and latest news from the world of international education.
          </p>
        </div>
      </section>

      {/* Blog Feed */}
      <section className="py-24 bg-white">
        <div className="container">
          <BlogFeed posts={blogPosts} activeCategory={activeCategory} categories={categories} />
        </div>
      </section>

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <section className="py-24 bg-off-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <SectionLabel>Blog FAQ</SectionLabel>
                <h2 className="text-3xl font-bold text-black mt-4">Frequently Asked Questions</h2>
              </div>
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
                <FAQAccordion items={faqs.map(f => ({ ...f, featured: f.is_featured }))} />
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
