"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import TiptapEditor from "@/components/cms/TiptapEditor";
import { BlogPost } from "@/lib/types/blog";

export default function BlogEditPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishDate, setPublishDate] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [body, setBody] = useState("");

  // Load post data
  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`/api/cms/blog/${id}`);
      if (res.ok) {
        const data: BlogPost = await res.json();
        setPost(data);
        setTitle(data.title);
        setSlug(data.slug);
        setCategory(data.category ?? "");
        setTags((data.tags ?? []).join(", "));
        setStatus(data.status);
        setPublishDate(data.publishDate?.split("T")[0] ?? "");
        setFeaturedImage(data.featuredImage ?? "");
        setBody(data.body ?? "");
      } else {
        toast.error("Post not found");
        router.push("/cms/blog");
      }
    };
    if (id) fetchPost();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    const data: Partial<BlogPost> = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      publishDate: publishDate || undefined,
      featuredImage,
      body,
    };
    const res = await fetch(`/api/cms/blog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Post updated");
      router.push("/cms/blog");
    } else {
      toast.error("Failed to update");
    }
  };

  if (!post) {
    return <div className="p-6">Loading...</div>;
  }

  const inputClasses = "w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none focus:border-[#A93226] transition-colors bg-white";

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <Toaster />
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cms/blog" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Back</Link>
        <h1 className="text-2xl font-[800] text-[#111]">Edit Blog Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#EDE8E8] rounded-[12px] p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-[10px] font-[700] text-[#999] uppercase mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-[10px] font-[700] text-[#999] uppercase mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-[700] text-[#999] uppercase mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[10px] font-[700] text-[#999] uppercase mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-[700] text-[#999] uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={inputClasses}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-[700] text-[#999] uppercase mb-1">Publish Date</label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-[700] text-[#999] uppercase mb-1">Featured Image Path</label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="/media-images/..."
              className={inputClasses}
            />
          </div>
        </div>

        <div className="bg-white border border-[#EDE8E8] rounded-[12px] p-6 shadow-sm">
          <label className="block text-[10px] font-[700] text-[#999] uppercase mb-3">Post Content</label>
          <TiptapEditor value={body} onChange={setBody} />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" className="bg-[#A93226] text-white px-8 py-2.5 rounded-[8px] font-[600] text-[13px] hover:bg-[#7E2219] transition-colors">
            Save Changes
          </button>
          <Link href="/cms/blog" className="px-6 py-2.5 rounded-[8px] font-[600] text-[13px] border border-[#E0DADA] text-[#555] hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
