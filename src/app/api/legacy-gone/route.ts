// Answers 410 Gone for old WordPress paths that have no equivalent page.
// Not called directly: next.config.ts rewrites the gone entries in
// src/lib/legacy-redirects.ts here. 410 (rather than 404) tells Google the
// URL was removed on purpose, so it drops it from the index sooner.
const gone = () =>
  new Response('Gone', {
    status: 410,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  })

export const GET = gone
export const HEAD = gone
export const POST = gone
export const PUT = gone
export const DELETE = gone
export const PATCH = gone
export const OPTIONS = gone
