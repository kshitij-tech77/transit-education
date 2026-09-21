import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface PreparedBlogHtml {
  /** Sanitised body HTML with an `id` on every h2/h3. */
  html: string;
  toc: TOCItem[];
  wordCount: number;
  /** Tag-free body text, for excerpts and the seo-check. */
  text: string;
}

const decodeEntities = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

export function htmlToText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "section"
  );
}

/**
 * Wrap every table in a scroll container. A table wider than the article
 * column (any three-column table on a phone) would otherwise be clipped at the
 * right edge. The inner div is the scroller: focusable so keyboard users can
 * scroll it, and named so a screen reader announces what it is. The outer div
 * only carries the border and the edge fades (see `.table-scroll` in
 * globals.css). Runs after sanitising, so the wrapper is never author input.
 */
function wrapTables(html: string): string {
  return html.replace(
    /<table\b[\s\S]*?<\/table>/gi,
    (table) =>
      `<div class="table-scroll"><div class="table-scroll-x" role="region" aria-label="Scrollable table" tabindex="0">${table}</div></div>`
  );
}

/**
 * Sanitise the body, guarantee a stable unique id on every h2/h3 (keeping an
 * id the author already set) and derive the table of contents from them.
 * Runs on the server so all of it lands in the initial HTML.
 */
export function prepareBlogHtml(rawHtml: string): PreparedBlogHtml {
  const clean = sanitizeBlogHtml(rawHtml, { demoteH1: true });
  const toc: TOCItem[] = [];
  const used = new Set<string>();

  const html = wrapTables(clean).replace(
    /<(h[23])((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      const text = htmlToText(inner);
      const idPattern = /\sid="([^"]*)"/i;
      let id = idPattern.exec(attrs)?.[1] || slugifyHeading(text);
      if (used.has(id)) {
        let n = 2;
        while (used.has(`${id}-${n}`)) n++;
        id = `${id}-${n}`;
      }
      used.add(id);
      toc.push({ id, text, level: Number(tag[1]) });
      const nextAttrs = idPattern.test(attrs) ? attrs.replace(idPattern, ` id="${id}"`) : `${attrs} id="${id}"`;
      return `<${tag}${nextAttrs}>${inner}</${tag}>`;
    }
  );

  const text = htmlToText(html);
  return { html, toc, wordCount: text ? text.split(/\s+/).length : 0, text };
}
