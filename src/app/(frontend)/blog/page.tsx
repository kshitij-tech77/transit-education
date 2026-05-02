import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import SectionLabel from "@/components/shared/SectionLabel";
import { Calendar, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function BlogListPage() {
  const posts = await getAllPosts();

  return (
    <div className="pb-24 pt-32">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <SectionLabel>Our Blog</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mt-4 mb-6">
            Latest News & Study Abroad Guides
          </h1>
          <p className="text-gray-600 text-lg">
            Stay updated with the latest visa policies, scholarship opportunities, and student life stories from around the world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.slug} className="group bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-brand bg-brand-light px-3 py-1 rounded-full">
                  {post.categories[0]}
                </span>
              </div>
              
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-bold text-black mb-4 group-hover:text-brand transition-colors line-clamp-2">
                  {post.title}
                </h2>
              </Link>
              
              <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-brand font-bold text-sm flex items-center gap-1 group/btn"
                >
                  Read More <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
