"use client";

import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";

export default function BlogContent({ html }: { html: string }) {
  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html) }}
    />
  );
}
