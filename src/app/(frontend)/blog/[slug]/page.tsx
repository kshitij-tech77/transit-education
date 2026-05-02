import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import SectionLabel from "@/components/shared/SectionLabel";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="pb-24 pt-32">
      <div className="container max-w-4xl">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>

        <div className="mb-12">
          <SectionLabel>{post.categories[0]}</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mt-4 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand" />
              {post.author}
            </div>
          </div>
        </div>

        <div className="prose prose-lg prose-headings:text-black prose-headings:font-bold prose-p:text-gray-600 prose-a:text-brand prose-img:rounded-2xl max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </div>
    </article>
  );
}
