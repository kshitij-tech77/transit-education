"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { BlogPost } from "@/lib/types/blog";

export default function BlogCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState(""); // comma separated
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishDate, setPublishDate] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    const res = await fetch("/api/cms/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Post created");
      router.push("/cms/blog");
    } else {
      toast.error("Failed to create");
    }
  };

  return (
    <section className="p-6">
      <Toaster />
      <h1 className="mb-4 text-2xl font-bold">Create New Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Leave empty to auto‑generate"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Publish Date</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Featured Image Path</label>
          <input
            type="text"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="/media-images/…"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Body</label>
          <TiptapEditor value={body} onChange={setBody} />
        </div>
        <div className="flex items-center space-x-3">
          <button type="submit" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            Save
          </button>
          <Link href="/cms/blog" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
