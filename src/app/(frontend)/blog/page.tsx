import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import Link from "next/link";
import blogPosts from "@/data/blogPosts.json";
import { Calendar, User, ArrowRight, Search } from "lucide-react";

export default function BlogPage() {
  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/media/2021/03/micheile-henderson-ZVprbBmT8QA-unsplash-scaled.jpg"
            alt="Transit Education Blog"
            fill
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
              {blogPosts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`} className="block relative h-[400px] rounded-[2.5rem] overflow-hidden mb-8 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-brand text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                        {post.category}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand" /> 
                        {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-brand" /> Admin
                      </span>
                    </div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-2xl md:text-3xl font-bold text-black group-hover:text-brand transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      Everything you need to know about navigating the latest requirements and ensuring a successful application journey for your chosen destination.
                    </p>
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-brand font-bold group/link"
                    >
                      Read Full Article <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
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
                  {['Canada', 'Australia', 'UK', 'USA', 'Visa Guides', 'Success Stories'].map((cat) => (
                    <li key={cat}>
                      <Link href="#" className="flex items-center justify-between text-gray-600 hover:text-brand font-medium transition-colors">
                        {cat} <span className="bg-white px-2 py-1 rounded-md text-[10px] text-gray-400 border border-gray-100">0</span>
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
                <div className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Your Email"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all"
                  />
                  <button className="w-full bg-white text-brand py-3 rounded-xl font-bold hover:bg-black hover:text-white transition-all">
                    Subscribe
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
