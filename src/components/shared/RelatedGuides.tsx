import { GUIDES } from "@/lib/study-abroad";
import { cn } from "@/lib/utils";

/**
 * Server-rendered links to the blog guides in GUIDES. Plain <a> elements, so the
 * links are in the HTML and need no JavaScript.
 */
export default function RelatedGuides({
  heading = "Related guides",
  className = "bg-white",
}: {
  heading?: string;
  className?: string;
}) {
  return (
    <section aria-labelledby="related-guides-heading" className={cn("py-16 border-t border-gray-100", className)}>
      <div className="container">
        <h2 id="related-guides-heading" className="text-2xl md:text-3xl font-bold text-black mb-8">
          {heading}
        </h2>
        <ul className="grid md:grid-cols-2 gap-6">
          {GUIDES.map((guide) => (
            <li key={guide.slug} className="bg-off-white border border-gray-100 rounded-2xl p-6">
              <a
                href={`/blog/${guide.slug}`}
                className="text-lg font-bold text-black leading-snug hover:text-brand underline decoration-brand/30 underline-offset-4 transition-colors"
              >
                {guide.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
