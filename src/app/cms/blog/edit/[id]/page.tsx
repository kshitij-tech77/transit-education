"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BlogEditor from "@/components/cms/BlogEditor";
import { BlogPost } from "@/lib/types/blog";
import { Loader2 } from "lucide-react";

export default function EditBlogPostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/cms/blog/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(true);
      }
    }
    if (id) fetchPost();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <button 
            onClick={() => router.push('/cms')}
            className="text-brand font-bold underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  return <BlogEditor initialData={post} isEdit />;
}
