/**
 * Legacy WordPress URL map.
 *
 * The previous site ran on WordPress, and Google Search Console still lists
 * its old paths as "Not found (404)". This file is the single source of truth
 * for where each of them should go. It is consumed by:
 *   - next.config.ts             (builds the redirects() and rewrites() tables)
 *   - src/app/api/legacy-gone    (the handler that answers 410 Gone)
 *   - scripts/check-legacy-redirects.ts (verifies a running build)
 *
 * Conventions
 *   - `source` is written once, without a trailing slash. Next compiles it
 *     so that "/contact-us" and "/contact-us/" both match. That only helps
 *     because next.config.ts disables Next's built-in slash 308, which would
 *     otherwise run first and add a second hop.
 *   - Every entry also gets an automatic "/index.php" twin (old WordPress
 *     permalinks worked with and without it), so "/index.php/our-team/" goes
 *     straight to "/team" rather than via "/our-team".
 *   - A destination must be a real page. It may never be another source in
 *     this file (that would create a chain). The check script enforces it.
 *   - Do not add a catch-all that sends unknown paths to "/". Google treats
 *     that as a soft 404.
 */

export type LegacyStatus = "redirect" | "gone";
export type LegacyConfidence = "high" | "medium" | "n/a";

export interface LegacyRedirect {
  /** Old path, no trailing slash (the config builder adds the slash form). */
  source: string;
  /** New path. Required for "redirect", absent for "gone". */
  destination?: string;
  status: LegacyStatus;
  confidence: LegacyConfidence;
  note: string;
}

/** Old path -> closest current page (or 410 when there is no equivalent). */
export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  // ── Company pages ────────────────────────────────────────────────────
  { source: "/contact-us", destination: "/contact", status: "redirect", confidence: "high", note: "Same page, new slug." },
  { source: "/index.php/contact", destination: "/contact", status: "redirect", confidence: "high", note: "Old WordPress index.php permalink." },
  { source: "/our-team", destination: "/team", status: "redirect", confidence: "high", note: "Same page, new slug." },
  { source: "/about-tiac", destination: "/about", status: "redirect", confidence: "medium", note: "TIAC content no longer exists; /about is the closest page." },

  // ── Test preparation ─────────────────────────────────────────────────
  { source: "/toefl", destination: "/courses/test-preparation", status: "redirect", confidence: "medium", note: "No dedicated TOEFL page exists." },
  { source: "/ielts", destination: "/courses/test-preparation", status: "redirect", confidence: "medium", note: "No dedicated IELTS course page exists." },
  { source: "/test-preparation-2", destination: "/courses/test-preparation", status: "redirect", confidence: "medium", note: "/services/test-preparation overlaps; see PR notes." },

  // ── Destinations ─────────────────────────────────────────────────────
  { source: "/new-zealand", destination: "/study-abroad/new-zealand", status: "redirect", confidence: "high", note: "Country page moved under /study-abroad." },
  { source: "/italy", destination: "/study-abroad/italy", status: "redirect", confidence: "high", note: "Country page moved under /study-abroad." },
  { source: "/australia", destination: "/study-abroad/australia", status: "redirect", confidence: "high", note: "Country page moved under /study-abroad." },
  { source: "/south-korea-2", destination: "/study-abroad/south-korea", status: "redirect", confidence: "high", note: "WordPress duplicate slug (-2) of the country page." },
  { source: "/netherlands", status: "gone", confidence: "n/a", note: "No Netherlands page exists. 410 rather than a redirect to an unrelated page." },
  { source: "/study-abroad", destination: "/", status: "redirect", confidence: "medium", note: "There is no /study-abroad hub page yet. Send to home; point at a hub once one is built." },
  { source: "/index.php/study-abroad", destination: "/", status: "redirect", confidence: "medium", note: "Same as /study-abroad." },

  // ── Branches ─────────────────────────────────────────────────────────
  { source: "/damauli", destination: "/locations/damauli", status: "redirect", confidence: "high", note: "Branch page moved under /locations." },
  { source: "/damak", destination: "/locations/damak", status: "redirect", confidence: "high", note: "Branch page moved under /locations." },
  { source: "/itahari", destination: "/locations/itahari", status: "redirect", confidence: "high", note: "Branch page moved under /locations." },

  // ── Services ─────────────────────────────────────────────────────────
  { source: "/scholarships-assistance", destination: "/services/scholarships-assistance", status: "redirect", confidence: "high", note: "Service page moved under /services." },
  { source: "/student-visa-service", destination: "/services/student-visa-service", status: "redirect", confidence: "high", note: "Service page moved under /services." },
  { source: "/admission-counseling", destination: "/services/admission-counselling", status: "redirect", confidence: "high", note: "US spelling in the old slug, UK spelling in the new one." },
  { source: "/index.php/services", destination: "/services", status: "redirect", confidence: "high", note: "Old WordPress index.php permalink (Search Console lists the http://transiteducation.com.np form)." },

  // ── Blog and articles ────────────────────────────────────────────────
  { source: "/blogs-articles", destination: "/blog", status: "redirect", confidence: "high", note: "Blog index moved." },
  {
    source: "/10-reasons-why-finland-is-the-best-destination-for-nepali-students",
    destination: "/blog/10-reasons-why-finland-is-the-best-destination-for-nepali-students",
    status: "redirect",
    confidence: "high",
    note: "Depends on the blog /blog/[slug] 500 fix shipping first.",
  },
  {
    source: "/top-10-reasons-for-studying-in-usa-2",
    destination: "/blog/top-10-reasons-for-studying-in-usa",
    status: "redirect",
    confidence: "high",
    note: "WordPress duplicate slug (-2). Depends on the blog 500 fix.",
  },
  {
    source: "/canada-study-visa-process-for-nepalese-student",
    destination: "/study-abroad/canada/visa",
    status: "redirect",
    confidence: "medium",
    note: "Topic match: the Canada visa guide.",
  },

  // ── WordPress system paths with no equivalent ────────────────────────
  { source: "/feed", status: "gone", confidence: "n/a", note: "WordPress RSS feed. The new feed is /rss.xml." },
  { source: "/wp-login.php", status: "gone", confidence: "n/a", note: "WordPress login." },
  { source: "/wp-admin", status: "gone", confidence: "n/a", note: "WordPress admin." },
  { source: "/xmlrpc.php", status: "gone", confidence: "n/a", note: "WordPress XML-RPC endpoint." },
];

/**
 * Pattern rules for old WordPress families. `sample` is a concrete path the
 * check script requests to exercise the pattern.
 */
export interface LegacyPatternRule {
  source: string;
  destination?: string;
  status: LegacyStatus;
  confidence: LegacyConfidence;
  note: string;
  sample: string;
  /** Where the sample must end up. Same rules as an exact entry. */
  sampleDestination?: string;
}

export const LEGACY_PATTERN_RULES: LegacyPatternRule[] = [
  {
    source: "/wp-content/:path*",
    status: "gone",
    confidence: "n/a",
    note: "Old uploads (including three PDFs under /wp-content/uploads/2025/03/). No current file matches, so 410.",
    sample: "/wp-content/uploads/2025/03/example.pdf",
  },
  {
    source: "/wp-includes/:path*",
    status: "gone",
    confidence: "n/a",
    note: "WordPress core assets.",
    sample: "/wp-includes/js/jquery/jquery.min.js",
  },
  {
    source: "/index.php/:path*",
    destination: "/:path*",
    status: "redirect",
    confidence: "medium",
    note: "Fallback for old index.php permalinks. Known paths are handled by their own entry so they take one hop; an unknown path still ends in the normal 404.",
    sample: "/index.php/contact-us",
    sampleDestination: "/contact",
  },
];

/**
 * Old WordPress search: /?s=term. Redirected to /blog with the query dropped.
 * Kept out of the tables above because it matches on a query key, not a path.
 * Handled in src/proxy.ts: config redirects always carry the query string
 * over, and a proxy response can drop it.
 */
export const LEGACY_SEARCH_REDIRECT = {
  queryKey: "s",
  destination: "/blog",
};

// ── Helpers shared by next.config.ts and the check script ───────────────

const INDEX_PHP = "/index.php";

/** An entry plus its "/index.php" twin (skipped when it already has one). */
export function expandWithIndexPhp(entry: LegacyRedirect): LegacyRedirect[] {
  if (entry.source.startsWith(`${INDEX_PHP}/`)) return [entry];
  return [entry, { ...entry, source: `${INDEX_PHP}${entry.source}` }];
}

/** Every exact entry the server must answer, index.php twins included. */
export function allExactEntries(): LegacyRedirect[] {
  const seen = new Set<string>();
  const out: LegacyRedirect[] = [];
  for (const entry of LEGACY_REDIRECTS.flatMap(expandWithIndexPhp)) {
    if (seen.has(entry.source)) continue;
    seen.add(entry.source);
    out.push(entry);
  }
  return out;
}

/**
 * Regex (no anchors, for a path-to-regexp custom parameter) that matches the
 * paths answered with 410, with or without a trailing slash. Used as a
 * negative lookahead by the generic rules in next.config.ts so a gone path is
 * never redirected on its way to the 410 handler.
 */
export function goneAlternation(): string {
  const escape = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exact = allExactEntries()
    .filter((e) => e.status === "gone")
    .map((e) => `${escape(e.source.slice(1))}/?$`);
  const prefixes = LEGACY_PATTERN_RULES.filter((r) => r.status === "gone").map(
    (r) => `${escape(r.source.slice(1).replace("/:path*", ""))}(?:/|$)`,
  );
  return [...exact, ...prefixes].join("|");
}

/**
 * The "/index.php/:path*" fallback as redirect rules. It skips gone paths
 * (those are answered with 410 directly). Known legacy paths never reach it
 * because their own "/index.php" twin entry is listed first.
 */
export function indexPhpFallbackRedirects(): { source: string; destination: string }[] {
  return [
    { source: INDEX_PHP, destination: "/" },
    { source: `${INDEX_PHP}/:path((?!(?:${goneAlternation()}))(?:[^/]+/)*[^/]+)`, destination: "/:path" },
  ];
}
