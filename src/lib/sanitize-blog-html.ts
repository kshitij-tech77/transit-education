import DOMPurify from "isomorphic-dompurify";

/**
 * Single source of truth for sanitising blog-post HTML. Used by the public
 * renderer (`BlogContent`) and the CMS editor's HTML-source preview so what an
 * editor previews is exactly what visitors get.
 *
 * DOMPurify defaults already allow the elements blog content uses
 * (`p h1-6 ul ol li a strong em table thead tbody tr th td img pre code
 * blockquote hr br`) and keep `id` attributes (needed for the heading anchors
 * the table-of-contents links to). We only widen it enough to keep
 * `target`/`rel` on links.
 */
export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html ?? "", {
    ADD_ATTR: ["target", "rel"],
  });
}
