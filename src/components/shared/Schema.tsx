/**
 * Serialise JSON-LD for an inline <script>. "<" is escaped so a value such as
 * "</script>" inside a post title or FAQ answer can never close the tag early.
 */
function serialize(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/** A complete JSON-LD document (already carrying its own @context / @graph). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(data) }} />;
}

export default function Schema({ type, data }: { type: string, data: Record<string, unknown> }) {
  return <JsonLd data={{ "@context": "https://schema.org", "@type": type, ...data }} />;
}
