"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { BlogPost } from "@/lib/types/blog";

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const fetchPosts = async () => {
    const res = await fetch("/api/cms/blog", { cache: "no-store" });
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/cms/blog/${id}`, { method: "DELETE" });
    if (res.ok) {
      // @ts-ignore
      toast.success("Post deleted");
      fetchPosts();
    }
  };

  return (
    <section className="p-6">
      <Toaster />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link
          href="/cms/blog/new"
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          New Post
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Publish Date</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-gray-200">
                <td className="p-2">{post.title}</td>
                <td className="p-2 capitalize">{post.status}</td>
                <td className="p-2">{post.publishDate?.split("T")[0] ?? "-"}</td>
                <td className="p-2 space-x-2">
                  <Link
                    href={`/cms/blog/${post.id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className={cn(buttonVariants({ variant: "destructive", size: "sm" }))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
