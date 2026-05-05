"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import { Calendar, User } from "lucide-react";

export default function LatestBlog({ posts }: { posts: any[] }) {
  const postsData = posts || [];
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Resources</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black">Insights & Guides</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <Link href="/blog" className="text-brand font-semibold hover:text-brand-dark transition-colors">
              Read all articles →
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {postsData.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="aspect-video bg-gray-100 rounded-2xl mb-6 overflow-hidden relative border border-gray-100 shadow-sm">
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-brand uppercase tracking-[0.15em]">
                  {post.category}
                </div>
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h3 className="font-bold text-xl mb-3 leading-snug group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                {post.body?.replace(/<[^>]*>?/gm, '').slice(0, 120)}...
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1.5"><User size={14} /> {post.authorName || 'Admin'}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
