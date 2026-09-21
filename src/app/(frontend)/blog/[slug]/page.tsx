import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/media-url";
import { notFound } from "next/navigation";
import {
  Calendar, User, Tag, Clock,
  ShieldCheck, CheckCircle2, ExternalLink, MessageSquareQuote,
} from "lucide-react";
import type { Metadata } from "next";
import BlogContent from "@/components/blog/BlogContent";
import InlineToc from "@/components/blog/InlineToc";
import TableOfContents from "@/components/blog/TableOfContents";
import ShareButtons from "@/components/blog/ShareButtons";
import { JsonLd } from "@/components/shared/Schema";
import { prepareBlogHtml } from "@/lib/blog-html";
import { getPublishedPost, getRelatedPosts, excerptFor } from "@/lib/blog-posts";
import {
  buildBlogGraph,
  buildBlogMetadata,
  canonicalFor,
  namedAuthor,
  validFaqs,
  validSources,
} from "@/lib/blog-seo";

// Rendered fresh on every request — CMS publishes/edits must show up
// immediately, and Vercel's ISR route cache was serving stale copies for
// minutes despite tag revalidation. See src/lib/revalidate-blog.ts.
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

// UTC keeps the printed date identical between the server, the datetime
// attribute and any crawler, regardless of the host's timezone.
function formatDate(iso: string, month: "long" | "short" = "long"): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month, day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  // A missing post renders the 404 page, which Next marks noindex itself.
  if (!post) return {};
  return buildBlogMetadata(post);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.category);

  const { html: bodyHtml, toc, wordCount } = prepareBlogHtml(post.body ?? "");
  const canonicalUrl = canonicalFor(post);
  const faqs = validFaqs(post.faq_schema);
  const sources = validSources(post.sources);
  const tags = post.tags ?? [];
  const answerSummary = post.answer_summary?.trim() ?? "";

  const author = namedAuthor(post);
  const authorName = author?.name ?? "";
  const authorCredential = author?.credential ?? "";
  const authorBio = author?.bio ?? "";
  const displayAuthor = authorName || "Transit Education";
  const reviewedAt = post.last_reviewed_at;

  const graph = buildBlogGraph(post, { wordCount, faqs, sources });
  const featured = post.featured_image ? resolveMediaUrl(post.featured_image) : "";

  return (
    <div className="pt-20">
      <JsonLd data={graph} />

      {/* ── Hero ── */}
      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-35">
          {featured && (
            <Image
              src={featured}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="container relative z-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-300 truncate max-w-xs" aria-current="page">{post.title}</span>
          </nav>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
              {post.category && (
                <span className="bg-brand text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {post.category}
                </span>
              )}
              {post.publish_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand" />
                  <time dateTime={post.publish_date}>{formatDate(post.publish_date)}</time>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand" /> {displayAuthor}
              </span>
              {post.reading_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand" /> {post.reading_time}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex gap-12 items-start">

              {/* ── Article ── */}
              <article className="flex-1 min-w-0">
                {/* Quick answer, directly after the H1 and before the body */}
                {answerSummary && (
                  <div
                    data-answer-summary
                    className="mb-8 p-6 bg-brand/5 border-l-4 border-brand rounded-r-2xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquareQuote className="w-4 h-4 text-brand" />
                      <p className="text-xs font-bold text-brand uppercase tracking-widest">
                        Quick Answer
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">{answerSummary}</p>
                  </div>
                )}

                {reviewedAt && (
                  <div className="mb-8 flex items-center gap-3 bg-green-50 text-green-700 px-5 py-3 rounded-2xl border border-green-100 text-sm font-medium">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>
                      Last reviewed{" "}
                      <time dateTime={reviewedAt}>{formatDate(reviewedAt)}</time>
                      {authorName && (
                        <>
                          {" by "}
                          <strong>{authorName}</strong>
                          {authorCredential && `, ${authorCredential}`}
                        </>
                      )}
                    </span>
                  </div>
                )}

                <InlineToc items={toc} />

                <BlogContent html={bodyHtml} />

                {tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium border border-gray-100"
                      >
                        <Tag className="w-3.5 h-3.5" /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <ShareButtons title={post.title} url={canonicalUrl} />
                </div>

                {/* FAQ: native <details>, so every answer is in the server HTML
                    whether or not the item is expanded. Same list feeds FAQPage. */}
                {faqs.length > 0 && (
                  <section className="mt-16" aria-labelledby="faq-heading">
                    <h2 id="faq-heading" className="text-2xl font-extrabold text-black mb-8 tracking-tight">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <details
                          key={i}
                          className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
                          open={i === 0}
                        >
                          <summary className="px-6 py-5 font-bold text-black cursor-pointer list-none flex justify-between items-center gap-4 hover:bg-gray-100 transition-colors">
                            <span>{faq.question}</span>
                            <span aria-hidden="true" className="text-brand shrink-0 text-xl leading-none group-open:rotate-45 transition-transform duration-200">+</span>
                          </summary>
                          <div className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.answer}</div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {sources.length > 0 && (
                  <section className="mt-12 pt-8 border-t border-gray-100" aria-labelledby="sources-heading">
                    <h2 id="sources-heading" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      Sources & References
                    </h2>
                    <ul className="space-y-2">
                      {sources.map((src) => (
                        <li key={src}>
                          {/* No nofollow: these are official / government references. */}
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener"
                            className="flex items-center gap-1.5 text-sm text-brand hover:underline break-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {src}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Author box only for a real, named author. Never invented. */}
                {authorName && (
                  <aside
                    aria-label="About the author"
                    className="mt-14 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div
                      aria-hidden="true"
                      className="w-20 h-20 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm text-2xl font-extrabold text-brand"
                    >
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 mb-1.5">
                        <p className="text-lg font-bold text-black">{authorName}</p>
                        {authorCredential && (
                          <span className="text-xs font-bold text-brand uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {authorCredential}
                          </span>
                        )}
                      </div>
                      {authorBio && <p className="text-gray-500 text-sm leading-relaxed">{authorBio}</p>}
                    </div>
                  </aside>
                )}
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

      {/* ── Related Posts: summary fields only, never full bodies ── */}
      {related.length > 0 && (
        <section className="py-24 bg-off-white">
          <div className="container">
            <div className="text-center mb-12">
              <SectionLabel>More for you</SectionLabel>
              <h2 className="text-3xl font-extrabold text-black mt-4 tracking-tight">Related Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((item) => {
                const image = item.featuredImage ? resolveMediaUrl(item.featuredImage) : "";
                const excerpt = excerptFor(item);
                return (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      {image && (
                        <Image
                          src={image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-6">
                      {item.category && (
                        <div className="text-[10px] font-bold text-brand uppercase tracking-widest mb-3">
                          {item.category}
                        </div>
                      )}
                      <h3 className="font-bold text-black group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      {excerpt && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{excerpt}</p>}
                      {item.publishDate && (
                        <p className="text-xs text-gray-400 mt-3">{formatDate(item.publishDate, "short")}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
