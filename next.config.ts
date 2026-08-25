import type { NextConfig } from "next";
import path from "path";

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
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://transiteducation.com.np https://images.unsplash.com https://flagcdn.com https://i.pravatar.cc https://vlrhwdcqzpfqpbqeaqyr.supabase.co https://res.cloudinary.com https://www.googletagmanager.com https://www.google-analytics.com",
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
  turbopack: {
    root: path.join(__dirname),
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
