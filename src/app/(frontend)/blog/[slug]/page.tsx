import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Calendar, User, Tag, ArrowLeft, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (!post) return {};

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || "Read the latest updates from Nepal's most trusted study abroad consultancy.",
    alternates: {
      canonical: post.canonical_url || `https://transiteducation.com.np/blog/${post.slug}`
    },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description,
      url: `https://transiteducation.com.np/blog/${post.slug}`,
      type: "article",
      images: [
        {
          url: post.featured_image || "/media-images/2021/05/Logo-png_website.png",
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta_title || post.title,
      description: post.meta_description,
      images: [post.featured_image || "/media-images/2021/05/Logo-png_website.png"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const [postRes, relatedRes] = await Promise.all([
    supabase
      .from('blog_posts')
      .select(`
        *,
        authors (
          name,
          credential,
          bio
        )
      `)
      .eq('slug', slug)
      .single(),
    supabase
      .from('blog_posts')
      .select('*')
      .neq('slug', slug)
      .eq('status', 'published')
      .limit(3)
  ]);

  const { data: post } = postRes;
  const { data: relatedRaw } = relatedRes;

  if (!post) {
    notFound();
  }

  // Transform post for compatibility
  const formattedPost = {
    ...post,
    publishDate: post.publish_date,
    featuredImage: post.featured_image,
    authorName: (post as any).authors?.name || "Transit Editorial Team",
    authorCredential: (post as any).authors?.credential,
    authorBio: (post as any).authors?.bio,
    lastReviewed: post.last_reviewed_at,
    faqItems: post.faq_schema || [],
    readingTime: post.reading_time
  };

  const blogPosts = relatedRaw?.map(p => ({
    ...p,
    publishDate: p.publish_date,
    featuredImage: p.featured_image
  })) || [];

  // Schema.org JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": formattedPost.title,
    "image": formattedPost.featuredImage,
    "author": {
      "@type": "Person",
      "name": formattedPost.authorName
    },
    "datePublished": formattedPost.publishDate,
    "dateModified": formattedPost.lastReviewed || formattedPost.publishDate,
    "publisher": {
      "@type": "Organization",
      "name": "Transit Education",
      "logo": {
        "@type": "ImageObject",
        "url": "https://transiteducation.com.np/logo.png"
      }
    }
  };

  const faqSchema = formattedPost.faqItems?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": formattedPost.faqItems.map((item: any) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  } : null;

  return (
    <main className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Hero Section */}
      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          {formattedPost.featuredImage && (
            <Image
              src={formattedPost.featuredImage}
              alt={formattedPost.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-brand font-bold mb-8 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
            </Link>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-6">
              <span className="bg-brand text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {formattedPost.category}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand" /> 
                {formattedPost.publishDate ? new Date(formattedPost.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand" /> {formattedPost.authorName}
              </span>
              {formattedPost.readingTime && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand" /> {formattedPost.readingTime}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {formattedPost.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Post Content */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {formattedPost.lastReviewed && (
              <div className="mb-12 flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-2xl border border-green-100 text-sm font-medium">
                <ShieldCheck className="w-5 h-5" />
                <span>Fact-checked and last reviewed on {new Date(formattedPost.lastReviewed).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}

            <div 
              className="prose prose-lg prose-slate max-w-none prose-headings:text-black prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-black prose-a:text-brand hover:prose-a:text-brand-dark transition-colors"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedPost.body) }}
            />
            
            {/* FAQ Section */}
            {formattedPost.faqItems && formattedPost.faqItems.length > 0 && (
              <div className="mt-20">
                <h2 className="text-3xl font-bold text-black mb-10">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {formattedPost.faqItems.map((faq: any, i: number) => (
                    <div key={i} className="bg-off-white p-8 rounded-[2rem] border border-gray-100">
                      <h3 className="text-lg font-bold text-black mb-3">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                {formattedPost.tags?.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-2 bg-off-white text-gray-500 px-4 py-2 rounded-xl text-sm font-medium border border-gray-100">
                    <Tag className="w-4 h-4" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Box */}
            <div className="mt-16 p-10 bg-off-white rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                <User className="w-12 h-12" />
              </div>
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mb-2">
                  <h3 className="text-xl font-bold text-black">{formattedPost.authorName}</h3>
                  {formattedPost.authorCredential && (
                    <span className="text-xs font-bold text-brand uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {formattedPost.authorCredential}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {formattedPost.authorBio || "Our team of expert counsellors and writers bring you the most accurate and up-to-date information regarding international education and visa processes."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="text-center mb-16">
            <SectionLabel>More for you</SectionLabel>
            <h2 className="text-3xl font-bold text-black mt-4">Related Articles</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(p => p.slug !== slug).slice(0, 3).map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="relative h-48 w-full overflow-hidden">
                  {relatedPost.featuredImage && (
                    <Image
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-black group-hover:text-brand transition-colors line-clamp-2 mb-4">{relatedPost.title}</h4>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{relatedPost.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
