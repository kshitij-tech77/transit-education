import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { resolveMediaUrl } from "@/lib/media-url";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import FAQAccordion from "@/components/shared/FAQAccordion";
import NewsletterForm from "@/components/layout/NewsletterForm";
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

export const dynamic = 'force-dynamic';

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
            src="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/03/micheile-henderson-ZVprbBmT8QA-unsplash-scaled.jpg"
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
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              {activeCategory && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">Showing:</span>
                  <span className="bg-brand text-white text-xs font-bold px-4 py-1.5 rounded-full">{activeCategory}</span>
                  <Link href="/blog" className="text-xs text-gray-400 hover:text-brand underline underline-offset-2">Clear filter</Link>
                </div>
              )}
              {blogPosts.length > 0 ? blogPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`} className="block relative h-[400px] rounded-[2.5rem] overflow-hidden mb-8 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                    {/* Fix #12 — always render an image; fallback when no thumbnail */}
                    <Image
                      src={post.featuredImage ? resolveMediaUrl(post.featuredImage) : "https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/03/micheile-henderson-ZVprbBmT8QA-unsplash-scaled.jpg"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {post.category && post.category.toLowerCase() !== "uncategorized" && (
                      <div className="absolute top-6 left-6">
                        <span className="bg-brand text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand" /> 
                        {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-brand" /> {post.authorName}
                      </span>
                    </div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-2xl md:text-3xl font-bold text-black group-hover:text-brand transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-brand font-bold group/link"
                    >
                      Read Full Article <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              )) : (
                <div className="py-20 text-center">
                  <p className="text-gray-500 text-lg">No blog posts found.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-12">
              {/* Search */}
              <div className="bg-off-white p-8 rounded-[2rem] border border-gray-100">
                <h3 className="text-xl font-bold text-black mb-6">Search Blog</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search topics..."
                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-off-white p-8 rounded-[2rem] border border-gray-100">
                <h3 className="text-xl font-bold text-black mb-6">Categories</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/blog" className={`flex items-center justify-between font-medium transition-colors ${!activeCategory ? 'text-brand' : 'text-gray-600 hover:text-brand'}`}>
                      All Posts
                      <span className="bg-white px-2 py-1 rounded-md text-[10px] text-gray-400 border border-gray-100">
                        {categories.reduce((s, c) => s + c.count, 0)}
                      </span>
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.name}>
                      <Link
                        href={`/blog?category=${encodeURIComponent(cat.name)}`}
                        className={`flex items-center justify-between font-medium transition-colors ${activeCategory === cat.name ? 'text-brand' : 'text-gray-600 hover:text-brand'}`}
                      >
                        {cat.name}
                        <span className="bg-white px-2 py-1 rounded-md text-[10px] text-gray-400 border border-gray-100">{cat.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="bg-brand p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <h3 className="text-2xl font-bold mb-4">Newsletter</h3>
                <p className="text-white/80 mb-8 text-sm leading-relaxed">
                  Get the latest updates and visa news directly in your inbox.
                </p>
                <NewsletterForm />
              </div>
            </aside>
          </div>
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
