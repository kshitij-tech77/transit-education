import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import Link from "next/link";
import blogPosts from "@/data/blogPosts.json";
import { notFound } from "next/navigation";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
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
                {post.category}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand" /> 
                {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand" /> Admin
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Post Content */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose prose-lg prose-slate max-w-none prose-headings:text-black prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-black prose-a:text-brand hover:prose-a:text-brand-dark transition-colors"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
            
            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
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
                <h3 className="text-xl font-bold text-black mb-2">Transit Editorial Team</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Our team of expert counsellors and writers bring you the most accurate and up-to-date information regarding international education and visa processes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts Placeholder */}
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
                  <Image
                    src={relatedPost.featuredImage}
                    alt={relatedPost.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
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
