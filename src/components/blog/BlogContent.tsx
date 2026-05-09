"use client";

import DOMPurify from "isomorphic-dompurify";

export default function BlogContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-lg prose-slate max-w-none prose-headings:text-black prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-black prose-a:text-brand hover:prose-a:text-brand-dark transition-colors"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
