import Link from "next/link";
import { JsonLd } from "@/components/shared/Schema";
import { absoluteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** "dark" sits on a black hero, "light" on a white one. */
export default function Breadcrumb({
  items,
  variant = "dark",
}: {
  items: BreadcrumbItem[];
  variant?: "dark" | "light";
}) {
  const light = variant === "light";
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-xs mb-6 font-medium flex-wrap",
        light ? "text-gray-500" : "text-gray-400",
      )}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true" className={light ? "text-gray-400" : "text-gray-600"}>/</span>}
          {/* The last item is the page you are on, so it is never a link. */}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className={light ? "hover:text-black transition-colors" : "hover:text-white transition-colors"}>
              {item.label}
            </Link>
          ) : (
            <span className={light ? "text-gray-800" : "text-gray-300"} aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** BreadcrumbList node for a trail, for use inside a JSON-LD @graph. */
export function breadcrumbListNode(items: BreadcrumbItem[], id?: string) {
  return {
    "@type": "BreadcrumbList",
    ...(id && { "@id": id }),
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href && { item: absoluteUrl(item.href) }),
    })),
  };
}

/** Standalone BreadcrumbList JSON-LD for a trail. */
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return <JsonLd data={{ "@context": "https://schema.org", ...breadcrumbListNode(items) }} />;
}
