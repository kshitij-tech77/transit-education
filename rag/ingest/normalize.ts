/**
 * Turn source content (TipTap HTML, jsonb, plain text) into clean text.
 * Pure functions, no I/O.
 */
import sanitizeHtml from 'sanitize-html';

const ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'",
  '&nbsp;': ' ', '&ndash;': '–', '&mdash;': '—', '&rsquo;': '’', '&lsquo;': '‘',
  '&rdquo;': '”', '&ldquo;': '“', '&hellip;': '…',
};

export function decodeEntities(text: string): string {
  return text
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo|hellip|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

export function collapseWhitespace(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** HTML -> readable text, keeping paragraph, list and table-row structure. */
export function htmlToText(html: string): string {
  if (!html) return '';
  const structured = html
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/(p|div|h[1-6]|ul|ol|blockquote|tr|table)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(td|th)>/gi, ' | ');
  const stripped = sanitizeHtml(structured, { allowedTags: [], allowedAttributes: {} });
  return collapseWhitespace(decodeEntities(stripped)).replace(/ \| \n/g, '\n');
}

/** Plain text that may still contain markup (FAQ answers written in the CMS). */
export function toPlainText(value: string | null | undefined): string {
  if (!value) return '';
  return /<[a-z][\s\S]*>/i.test(value) ? htmlToText(value) : collapseWhitespace(decodeEntities(value));
}

export interface HtmlSection {
  h2: string | null;
  h3: string | null;
  text: string;
}

/**
 * Split TipTap HTML on <h2>/<h3>. Text before the first heading has a null
 * heading path. Empty sections are dropped.
 */
export function splitHtmlSections(html: string): HtmlSection[] {
  const sections: HtmlSection[] = [];
  const headingRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let h2: string | null = null;
  let h3: string | null = null;
  let last = 0;
  let m: RegExpExecArray | null;

  const push = (chunkHtml: string) => {
    const text = htmlToText(chunkHtml);
    if (text) sections.push({ h2, h3, text });
  };

  while ((m = headingRe.exec(html))) {
    push(html.slice(last, m.index));
    const label = htmlToText(m[2]).replace(/\n/g, ' ');
    if (m[1] === '2') { h2 = label; h3 = null; } else { h3 = label; }
    last = m.index + m[0].length;
  }
  push(html.slice(last));
  return sections;
}

/** Render arbitrary jsonb (arrays, {title,text}, nested objects) as readable lines. */
export function jsonToText(value: unknown, depth = 0): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return toPlainText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const pad = '  '.repeat(depth);

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const o = item as Record<string, unknown>;
          const head = o.title ?? o.name ?? o.question ?? o.label;
          const body = o.text ?? o.description ?? o.answer ?? o.value;
          if (head !== undefined && body !== undefined && Object.keys(o).length <= 3) {
            return `${pad}- ${jsonToText(head)}: ${jsonToText(body)}`;
          }
          return `${pad}- ${jsonToText(o, depth + 1).trimStart()}`;
        }
        return `${pad}- ${jsonToText(item, depth + 1)}`;
      })
      .filter((l) => l.trim() !== '-')
      .join('\n');
  }

  return Object.entries(value as Record<string, unknown>)
    .map(([k, v]) => {
      const rendered = jsonToText(v, depth + 1);
      if (!rendered) return '';
      const label = k.replace(/[_-]+/g, ' ');
      return rendered.includes('\n') ? `${pad}${label}:\n${rendered}` : `${pad}${label}: ${rendered}`;
    })
    .filter(Boolean)
    .join('\n');
}
