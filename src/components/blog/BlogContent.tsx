"use client";

import DOMPurify from "isomorphic-dompurify";

export default function BlogContent({ html }: { html: string }) {
  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
