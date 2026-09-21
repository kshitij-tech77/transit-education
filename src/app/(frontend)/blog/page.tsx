import { SITE_URL } from "@/lib/site-url";
import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import FAQAccordion from "@/components/shared/FAQAccordion";
import { JsonLd } from "@/components/shared/Schema";
import BlogFeed from "@/components/blog/BlogFeed";
import { Metadata } from "next";
import { cleanDescription } from "@/lib/blog-posts";
import { RSS_URL } from "@/lib/blog-seo";

export const metadata: Metadata = {
  title: "Study Abroad Blog | Visa Tips, University Guides | Transit Education",
  description: "Expert articles on student visas, IELTS preparation, university admissions, and life abroad. Written by Transit Education's certified counsellors in Nepal.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: { "application/rss+xml": [{ url: RSS_URL, title: "Transit Education Blog" }] },
  },
  openGraph: {
    title: "Study Abroad Blog | Transit Education Nepal",
    description: "Visa tips, scholarship news, IELTS guides, and destination insights from Nepal's most trusted study abroad consultancy.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

// Rendered fresh on every request so newly published / edited posts show up
// immediately (Vercel's ISR route cache was serving stale copies).
export const dynamic = "force-dynamic";

async function getBlogPosts(category?: string) {
  const postsQuery = supabase
    .from('blog_posts')
    // Only what the feed cards render. The article body is deliberately not
    // read: the feed is a client component, so anything passed to it is
    // serialised into the RSC payload of every /blog request.
    .select('id, slug, title, category, featured_image, publish_date, meta_description, authors (name)')
    .eq('status', 'published')
    .order('publish_date', { ascending: false });

  if (category) postsQuery.eq('category', category);

  const res = await postsQuery;
  return { data: res.data };
}

async function getBlogCategories() {
  const res = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published');
  return { data: res.data };
}

async function getBlogPageFaqs() {
  const res = await supabase
    .from('faqs')
    .select('*')
    .eq('page_path', 'Blog')
    .eq('status', 'published')
    .order('display_order', { ascending: true });
  return { data: res.data };
}

// Supabase types a to-one join as an object or a one-element array depending on
// how the relationship is declared; accept both.
function relationName(rel: { name: string | null } | { name: string | null }[] | null | undefined): string | null {
  const one = Array.isArray(rel) ? rel[0] : rel;
  return one?.name ?? null;
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: activeCategory } = await searchParams;

  const [{ data: posts }, { data: categoriesRaw }, { data: faqs }] = await Promise.all([
    getBlogPosts(activeCategory),
    getBlogCategories(),
    getBlogPageFaqs(),
  ]);

  const blogPosts = posts?.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    publishDate: p.publish_date,
    featuredImage: p.featured_image,
    authorName: relationName(p.authors) || "Transit Education",
    excerpt: cleanDescription(p.meta_description),
  })) || [];

  /* Fix #19 — filter UNCATEGORIZED from public-facing category list */
  const categoryCounts: Record<string, number> = {};
  for (const row of categoriesRaw ?? []) {
    const cat = row.category?.trim();
    if (!cat || cat.toLowerCase() === "uncategorized") continue;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <div className="pt-20">
      {faqSchema && <JsonLd data={faqSchema} />}
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
                <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4">Frequently Asked Questions</h2>
              </div>
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
                <FAQAccordion items={faqs.map(f => ({ ...f, featured: f.is_featured }))} />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
