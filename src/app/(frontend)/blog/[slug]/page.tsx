import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { resolveMediaUrl } from "@/lib/media-url";
import { notFound } from "next/navigation";
import {
  Calendar, User, Tag, ArrowLeft, Clock,
  ShieldCheck, CheckCircle2, ExternalLink, MessageSquareQuote,
} from "lucide-react";
import { Metadata } from "next";
import BlogContent from "@/components/blog/BlogContent";
import TableOfContents, { type TOCItem } from "@/components/blog/TableOfContents";
import ShareButtons from "@/components/blog/ShareButtons";
import { unstable_cache } from "next/cache";

export const dynamic = 'force-dynamic';

// `slug` is passed as an argument, so each post gets its own cache entry,
// revalidated every 5 minutes.
const getCachedBlogPostMeta = unstable_cache(
  async (slug: string) => {
    const res = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    return { data: res.data };
  },
  ['blog-post-metadata'],
  { revalidate: 300, tags: ['blog-posts'] }
);

const getCachedBlogPostDetail = unstable_cache(
  async (slug: string) => {
    const res = await supabase
      .from("blog_posts")
      .select("*, authors (name, credential, bio)")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    return { data: res.data };
  },
  ['blog-post-detail'],
  { revalidate: 300, tags: ['blog-posts'] }
);

const getCachedRelatedBlogPosts = unstable_cache(
  async (slug: string) => {
    const res = await supabase
      .from("blog_posts")
      .select("id, title, slug, category, featured_image, publish_date")
      .neq("slug", slug)
      .eq("status", "published")
      .limit(3);
    return { data: res.data };
  },
  ['blog-post-related'],
  { revalidate: 300, tags: ['blog-posts'] }
);

const TRANSIT_LOGO =
  "https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/05/Logo-png_website.png";

// ── Inject heading IDs + extract TOC ────────────────────────────
function processBody(html: string): { html: string; toc: TOCItem[] } {
  const toc: TOCItem[] = [];
  const counts: Record<string, number> = {};
  const processed = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/h[23]>/gi,
    (_match, tag, attrs, content) => {
      const text = content.replace(/<[^>]+>/g, "").trim();
      const base = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "section";
      counts[base] = (counts[base] || 0) + 1;
      const id = counts[base] > 1 ? `${base}-${counts[base]}` : base;
      toc.push({ id, text, level: parseInt(tag[1]) });
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    }
  );
  return { html: processed, toc };
}

function countWords(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

// ── Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await getCachedBlogPostMeta(slug);

  if (!post) return {};

  return {
    title: post.meta_title || post.title,
    description:
      (post.meta_description || "Read the latest updates from Nepal's most trusted study abroad consultancy.")
        .replace(/\s*\*[…\.]{1,3}\s*$/, "")
        .trim(),
    alternates: {
      canonical:
        post.canonical_url || `https://transiteducation.com.np/blog/${post.slug}`,
    },
    openGraph: {
      title: post.meta_title || post.title,
      description: (post as any).og_description || post.meta_description,
      url: `https://transiteducation.com.np/blog/${post.slug}`,
      type: "article",
      images: [
        {
          url: post.featured_image || TRANSIT_LOGO,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta_title || post.title,
      description: post.meta_description,
      images: [post.featured_image || TRANSIT_LOGO],
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [postRes, relatedRes] = await Promise.all([
    getCachedBlogPostDetail(slug),
    getCachedRelatedBlogPosts(slug),
  ]);

  const { data: post } = postRes;
  if (!post) notFound();

  const author = (post as any).authors;
  const formattedPost = {
    ...post,
    publishDate: post.publish_date,
    featuredImage: post.featured_image,
    authorName: author?.name || "Transit Education",
    authorCredential: author?.credential || "",
    authorBio: author?.bio || "",
    authorAvatar: (post as any).author_avatar_url || null,
    lastReviewed: post.last_reviewed_at,
    faqItems: (post as any).faq_schema || [],
    readingTime: post.reading_time,
    answerSummary: (post as any).answer_summary || "",
    sources: (post as any).sources || [],
    tags: post.tags || [],
    ogDescription: (post as any).og_description || "",
    secondaryKeywords: (post as any).secondary_keywords || [],
  };

  const { html: processedBody, toc } = processBody(formattedPost.body || "");
  const wordCount = countWords(formattedPost.body || "");
  const canonicalUrl =
    post.canonical_url || `https://transiteducation.com.np/blog/${slug}`;

  const blogPosts = (relatedRes.data || []).map((p) => ({
    ...p,
    publishDate: p.publish_date,
    featuredImage: p.featured_image,
  }));

  // ── JSON-LD ──────────────────────────────────────────────────
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: formattedPost.title,
    image: formattedPost.featuredImage || TRANSIT_LOGO,
    author: {
      "@type": author ? "Person" : "Organization",
      name: formattedPost.authorName,
    },
    datePublished: formattedPost.publishDate,
    dateModified: formattedPost.lastReviewed || formattedPost.publishDate,
    wordCount,
    keywords: [...formattedPost.tags, ...formattedPost.secondaryKeywords].join(", "),
    publisher: {
      "@type": "Organization",
      name: "Transit Education",
      logo: { "@type": "ImageObject", url: TRANSIT_LOGO },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    ...(formattedPost.answerSummary && {
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["[data-answer-summary]"],
      },
    }),
  };

  const faqSchema =
    formattedPost.faqItems?.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: formattedPost.faqItems.map((item: any) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://transiteducation.com.np" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://transiteducation.com.np/blog" },
      { "@type": "ListItem", position: 3, name: formattedPost.title, item: canonicalUrl },
    ],
  };

  return (
    <main className="pt-20">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Hero ── */}
      <section className="bg-black py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-35">
          {formattedPost.featuredImage && (
            <Image
              src={resolveMediaUrl(formattedPost.featuredImage)}
              alt={formattedPost.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="container relative z-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-300 truncate max-w-xs">{formattedPost.title}</span>
          </nav>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
              <span className="bg-brand text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {formattedPost.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand" />
                <time dateTime={formattedPost.publishDate}>
                  {formattedPost.publishDate
                    ? new Date(formattedPost.publishDate).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })
                    : "Recently"}
                </time>
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand" /> {formattedPost.authorName}
              </span>
              {formattedPost.readingTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand" /> {formattedPost.readingTime}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {formattedPost.title}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex gap-12 items-start">

              {/* ── Article ── */}
              <article className="flex-1 min-w-0">
                {/* Fact-check banner */}
                {formattedPost.lastReviewed && (
                  <div className="mb-8 flex items-center gap-3 bg-green-50 text-green-700 px-5 py-3 rounded-2xl border border-green-100 text-sm font-medium">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>
                      Fact-checked by{" "}
                      <strong>{formattedPost.authorCredential || "Transit Education experts"}</strong>
                      {" · "}
                      <time dateTime={formattedPost.lastReviewed}>
                        {new Date(formattedPost.lastReviewed).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        })}
                      </time>
                    </span>
                  </div>
                )}

                {/* Quick Answer — GEO/AI snippet */}
                {formattedPost.answerSummary && (
                  <div
                    data-answer-summary
                    className="mb-10 p-6 bg-brand/5 border-l-4 border-brand rounded-r-2xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquareQuote className="w-4 h-4 text-brand" />
                      <span className="text-xs font-bold text-brand uppercase tracking-widest">
                        Quick Answer
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {formattedPost.answerSummary}
                    </p>
                  </div>
                )}

                <BlogContent html={processedBody} />

                {/* Tags */}
                {formattedPost.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                    {formattedPost.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium border border-gray-100 hover:border-brand hover:text-brand transition-colors"
                      >
                        <Tag className="w-3.5 h-3.5" /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Share */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <ShareButtons title={formattedPost.title} url={canonicalUrl} />
                </div>

                {/* FAQ */}
                {formattedPost.faqItems.length > 0 && (
                  <div className="mt-16">
                    <h2 className="text-2xl font-extrabold text-black mb-8 tracking-tight">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {formattedPost.faqItems.map((faq: any, i: number) => (
                        <details
                          key={i}
                          className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
                          open={i === 0}
                        >
                          <summary className="px-6 py-5 font-bold text-black cursor-pointer list-none flex justify-between items-center gap-4 hover:bg-gray-100 transition-colors">
                            <span>{faq.question}</span>
                            <span className="text-brand shrink-0 text-xl leading-none group-open:rotate-45 transition-transform duration-200">+</span>
                          </summary>
                          <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {formattedPost.sources.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      Sources & References
                    </h4>
                    <ul className="space-y-2">
                      {formattedPost.sources.map((src: string, i: number) => (
                        <li key={i}>
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-brand hover:underline break-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {src}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Author E-E-A-T box */}
                <div className="mt-14 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center shrink-0 p-2 shadow-sm">
                    <Image
                      src={formattedPost.authorAvatar || TRANSIT_LOGO}
                      alt={formattedPost.authorName}
                      width={72}
                      height={72}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-black">{formattedPost.authorName}</h3>
                      {formattedPost.authorCredential && (
                        <span className="text-xs font-bold text-brand uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {formattedPost.authorCredential}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {formattedPost.authorBio ||
                        "Our team of expert counsellors and writers bring you the most accurate and up-to-date information regarding international education and visa processes."}
                    </p>
                  </div>
                </div>
              </article>

              {/* ── Sticky TOC ── */}
              {toc.length > 0 && (
                <aside className="hidden lg:block w-[260px] shrink-0">
                  <TableOfContents items={toc} />
                </aside>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Posts ── */}
      {blogPosts.length > 0 && (
        <section className="py-20 bg-off-white">
          <div className="container">
            <div className="text-center mb-12">
              <SectionLabel>More for you</SectionLabel>
              <h2 className="text-3xl font-extrabold text-black mt-4 tracking-tight">Related Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    {relatedPost.featuredImage && (
                      <Image
                        src={resolveMediaUrl(relatedPost.featuredImage)}
                        alt={relatedPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-bold text-brand uppercase tracking-widest mb-3">
                      {relatedPost.category}
                    </div>
                    <h4 className="font-bold text-black group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                      {relatedPost.title}
                    </h4>
                    {relatedPost.publishDate && (
                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(relatedPost.publishDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
