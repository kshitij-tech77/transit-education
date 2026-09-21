/**
 * Canonical production origin. Hosting (Vercel) permanently redirects the apex
 * domain to www, so www is the host every canonical tag, sitemap entry, OG tag,
 * JSON-LD id, RSS link and llms.txt link must use. Overridable per environment
 * via SITE_URL (e.g. a preview deploy or local `next start`).
 */
const DEFAULT_SITE_URL = "https://www.transiteducation.com.np";

export const SITE_URL = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

/** Absolute URL on the canonical host for a root-relative path. */
export function absoluteUrl(path = ""): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
