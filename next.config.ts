import type { NextConfig } from "next";
import path from "path";
import {
  LEGACY_PATTERN_RULES,
  allExactEntries,
  goneAlternation,
  indexPhpFallbackRedirects,
} from "./src/lib/legacy-redirects";

const __impeccableLiveSrc =
  process.env.NODE_ENV === "development" ? " http://localhost:8400" : "";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com${__impeccableLiveSrc}`,
      "object-src 'none'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://transiteducation.com.np https://www.transiteducation.com.np https://images.unsplash.com https://flagcdn.com https://i.pravatar.cc https://res.cloudinary.com https://www.googletagmanager.com https://www.google-analytics.com",
      `connect-src 'self' https://vlrhwdcqzpfqpbqeaqyr.supabase.co wss://vlrhwdcqzpfqpbqeaqyr.supabase.co https://res.cloudinary.com https://maps.googleapis.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net${__impeccableLiveSrc}`,
      "frame-src https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Next's built-in "/x/" -> "/x" redirect runs before every custom redirect,
  // so a legacy URL such as /contact-us/ would take that hop first and only
  // then reach its redirect. It is switched off here and re-added as the LAST
  // rule in redirects() below, so legacy entries win and everything else is
  // normalised exactly as before.
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: path.join(__dirname),
  },
  // Legacy WordPress URLs (map lives in src/lib/legacy-redirects.ts). Next
  // compiles each source so it matches with or without a trailing slash.
  async redirects() {
    const exact = allExactEntries()
      .filter((e) => e.status === "redirect")
      .map((e) => ({ source: e.source, destination: e.destination!, permanent: true }));
    // Specific entries first so the /index.php fallback only sees paths that
    // have no entry of their own.
    const indexPhp = indexPhpFallbackRedirects().map((r) => ({ ...r, permanent: true }));
    // Same behaviour as the built-in rule (308, query kept). Gone paths are
    // excluded so their slash form reaches the 410 handler in one step.
    const trailingSlash = {
      source: `/:path((?!(?:${goneAlternation()})).+)/`,
      destination: "/:path",
      permanent: true,
    };
    return [...exact, ...indexPhp, trailingSlash];
  },
  // 410 Gone has no config equivalent, so gone paths are rewritten to a route
  // handler that answers 410. beforeFiles keeps them ahead of any page.
  async rewrites() {
    const gone = [
      ...allExactEntries().filter((e) => e.status === "gone").map((e) => e.source),
      ...LEGACY_PATTERN_RULES.filter((r) => r.status === "gone").map((r) => r.source),
    ];
    return {
      beforeFiles: gone.map((source) => ({ source, destination: "/api/legacy-gone" })),
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year - images rarely change; new uploads get new year/month/filename paths so long-lived caching doesn't risk staleness
    remotePatterns: [
      // www is the canonical host (SITE_URL); the apex stays allowed because
      // existing content and DB rows still reference apex image URLs.
      {
        protocol: 'https',
        hostname: 'www.transiteducation.com.np',
      },
      {
        protocol: 'https',
        hostname: 'transiteducation.com.np',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'vlrhwdcqzpfqpbqeaqyr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/xgpct4gs/**',
      },
    ],
  },
};

export default nextConfig;
