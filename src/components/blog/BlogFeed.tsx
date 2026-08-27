"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media-url";
import NewsletterForm from "@/components/layout/NewsletterForm";

interface BlogFeedPost {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  featuredImage: string | null;
  publishDate: string | null;
  authorName: string;
  excerpt: string;
}

interface BlogFeedCategory {
  name: string;
  count: number;
}

interface BlogFeedProps {
  posts: BlogFeedPost[];
  activeCategory?: string;
  categories: BlogFeedCategory[];
}

export default function BlogFeed({ posts, activeCategory, categories }: BlogFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.trim().toLowerCase();

  const filteredPosts = query
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          (post.category ?? "").toLowerCase().includes(query)
      )
    : posts;

  return (
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
        {filteredPosts.length > 0 ? filteredPosts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/blog/${post.slug}`} className="block relative h-[400px] rounded-[2.5rem] overflow-hidden mb-8 shadow-lg group-hover:shadow-2xl transition-all duration-500">
              {/* Fix #12 — always render an image; fallback when no thumbnail */}
              <Image
                src={post.featuredImage ? resolveMediaUrl(post.featuredImage) : "https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/03/micheile-henderson-ZVprbBmT8QA-unsplash-scaled.webp"}
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
                  {post.publishDate
                    ? new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : "Recently"}
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
            <p className="text-gray-500 text-lg">
              {query ? "No articles found for your search." : "No blog posts found."}
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="space-y-12">
        {/* Search */}
        <div className="bg-off-white p-8 rounded-3xl border border-gray-100">
          <h3 className="text-xl font-bold text-black mb-6">Search Blog</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-off-white p-8 rounded-3xl border border-gray-100">
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
  );
}
