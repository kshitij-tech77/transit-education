import sanitizeHtml from "sanitize-html";

/**
 * Single source of truth for sanitising blog-post HTML. Used by the public
 * renderer (`BlogContent`) and the CMS editor's HTML-source preview so what an
 * editor previews is exactly what visitors get.
 *
 * This deliberately uses `sanitize-html` (pure JS, htmlparser2) instead of
 * `isomorphic-dompurify`. The latter pulls in jsdom on the server, and jsdom 28
 * requires an ESM-only dependency (`@exodus/bytes`) via `require()`. On a Node
 * runtime older than 20.19 / 22.12 that throws ERR_REQUIRE_ESM while the
 * `BlogContent` client component is server-rendered, which surfaced as an HTTP
 * 500 on every /blog/[slug] page. `sanitize-html` has no such requirement.
 */

const TABLE_TAGS = ["table", "thead", "tbody", "tfoot", "tr", "th", "td"];

const LENGTH = /^-?\d+(?:\.\d+)?(?:px|%|em|rem)?$/;
const COLOR = /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i;
const BORDER = /^[\w\s#.,%()-]+$/;

const TABLE_STYLES = {
  width: [LENGTH],
  "min-width": [LENGTH],
  height: [LENGTH],
  padding: [LENGTH],
  "text-align": [/^(?:left|right|center|justify)$/],
  "vertical-align": [/^(?:top|middle|bottom|baseline)$/],
  color: [COLOR],
  "background-color": [COLOR],
  background: [COLOR],
  border: [BORDER],
  "border-collapse": [/^(?:collapse|separate)$/],
  "border-color": [COLOR],
};

const ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": { "text-align": TABLE_STYLES["text-align"] },
  ...Object.fromEntries(TABLE_TAGS.map((tag) => [tag, TABLE_STYLES])),
};

const BASE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "div", "span", "br", "hr",
    "ul", "ol", "li",
    "table", "caption", "colgroup", "col", "thead", "tbody", "tfoot", "tr", "th", "td",
    "a", "strong", "b", "em", "i", "u", "s", "sub", "sup", "mark", "small",
    "blockquote", "pre", "code",
    "img", "figure", "figcaption",
  ],
  allowedAttributes: {
    "*": ["id", "class"],
    a: ["href", "rel", "target", "title", "name"],
    img: ["src", "alt", "title", "width", "height", "loading", "srcset", "sizes"],
    th: ["colspan", "rowspan", "colwidth", "scope", "style"],
    td: ["colspan", "rowspan", "colwidth", "style"],
    table: ["style"],
    thead: ["style"],
    tbody: ["style"],
    tfoot: ["style"],
    tr: ["style"],
    col: ["span", "width"],
    colgroup: ["span"],
    ol: ["start", "type"],
  },
  allowedStyles: ALLOWED_STYLES,
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowProtocolRelative: false,
  // Drop the contents (not just the tag) of anything that could execute or
  // restyle the page. Every other disallowed tag keeps its text.
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed"],
  transformTags: {
    a: (tagName, attribs) => {
      // Any link that opens a new browsing context must not leak window.opener.
      if (attribs.target === "_blank") {
        const rel = new Set((attribs.rel || "").split(/\s+/).filter(Boolean));
        rel.add("noopener");
        attribs.rel = [...rel].join(" ");
      }
      return { tagName, attribs };
    },
  },
};

export interface SanitizeBlogHtmlOptions {
  /**
   * Render body `<h1>` as `<h2>`. The page template already owns the single
   * `<h1>` (the post title), so a second one in the body would break the
   * one-h1-per-page rule. The editor preview leaves headings untouched.
   */
  demoteH1?: boolean;
}

export function sanitizeBlogHtml(html: string, options: SanitizeBlogHtmlOptions = {}): string {
  const transformTags = options.demoteH1
    ? { ...BASE_OPTIONS.transformTags, h1: "h2" }
    : BASE_OPTIONS.transformTags;
  return sanitizeHtml(html ?? "", { ...BASE_OPTIONS, transformTags });
}
