"use client";

import { useState, useEffect } from "react";
import { List } from "lucide-react";

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ items }: { items: TOCItem[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-15% 0% -70% 0%", threshold: 0 }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-28 bg-white border border-gray-100 rounded-2xl p-6 max-h-[calc(100vh-9rem)] overflow-y-auto shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-brand shrink-0" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contents</p>
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm py-1.5 border-l-2 transition-all duration-150 ${
                item.level === 3 ? "pl-5" : "pl-3"
              } ${
                active === item.id
                  ? "border-brand text-brand font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
