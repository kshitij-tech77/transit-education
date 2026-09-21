/**
 * Server component. `html` must already be sanitised by `prepareBlogHtml`, so
 * nothing here is client code: the article ships as plain HTML instead of being
 * serialised a second time into the RSC payload.
 */
export default function BlogContent({ html }: { html: string }) {
  return <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
