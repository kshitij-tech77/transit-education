import { List } from "lucide-react";
import type { TOCItem } from "@/lib/blog-html";

/**
 * Collapsible table of contents for screens without the sticky sidebar. Plain
 * server markup (native <details>), so every heading link is in the initial HTML.
 */
export default function InlineToc({ items }: { items: TOCItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Table of contents" className="lg:hidden mb-10">
      <details className="bg-gray-50 border border-gray-100 rounded-2xl">
        <summary className="px-5 py-4 cursor-pointer list-none flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <List className="w-4 h-4 text-brand shrink-0" /> Contents
        </summary>
        <ul className="px-5 pb-4 space-y-1">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
              <a href={`#${item.id}`} className="block py-1 text-sm text-gray-600 hover:text-brand">
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
