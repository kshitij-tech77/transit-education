import { CLOUDINARY_BASE, MEDIA_BASE } from "@/constants/assets"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_MEDIA_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/media/`
const CLOUDINARY_MEDIA_PREFIX = `${CLOUDINARY_BASE}/media/`

// Media paths that stay on Supabase instead of Cloudinary. As of this
// migration, that's a single file: 2025/02/Office-1.png is 10.93 MB, over
// Cloudinary's 10 MB free-tier upload limit, so it was never migrated.
// TEMPORARY: remove this once that file is compressed and re-uploaded to
// Cloudinary, or the Cloudinary plan is upgraded past the 10 MB cap.
const SUPABASE_ONLY_PATHS = ['2025/02/Office-1.png']

// Extracts the path relative to media/ from any URL shape resolveMediaUrl
// accepts, or null if it's not a media/ URL at all (e.g. some other origin).
function extractMediaPath(url: string): string | null {
  if (CLOUDINARY_BASE && url.startsWith(CLOUDINARY_MEDIA_PREFIX)) {
    return url.slice(CLOUDINARY_MEDIA_PREFIX.length)
  }
  if (url.startsWith(SUPABASE_MEDIA_PREFIX)) {
    return url.slice(SUPABASE_MEDIA_PREFIX.length)
  }
  if (url.startsWith('/media/')) {
    return url.slice('/media/'.length)
  }
  if (url.startsWith('http')) {
    return null
  }
  return url
}

// Resolves every media URL shape found in the database to a Cloudinary
// delivery URL (the migration's new source of truth):
//   ''/null                                          →  ''
//   a path in SUPABASE_ONLY_PATHS                    →  kept on Supabase
//   already a Cloudinary URL                         →  returned as-is
//   full Supabase Storage URL (.../public/media/...) →  rewritten to Cloudinary
//   /media/2025/02/image.png                         →  rewritten to Cloudinary
//   https://other-origin/...                         →  returned as-is
//   anything else (e.g. a bare relative path)         →  rewritten to Cloudinary
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  const mediaPath = extractMediaPath(trimmed)
  if (mediaPath && SUPABASE_ONLY_PATHS.includes(mediaPath)) {
    return `${SUPABASE_MEDIA_PREFIX}${mediaPath}`
  }

  // Guard against the empty-string fallback in CLOUDINARY_BASE: `"".startsWith("")`
  // is true for every string, which would otherwise make this branch swallow
  // every URL as a silent passthrough if the env var were ever unset.
  if (CLOUDINARY_BASE && trimmed.startsWith(CLOUDINARY_BASE)) return trimmed

  if (trimmed.startsWith(SUPABASE_MEDIA_PREFIX)) {
    return `${CLOUDINARY_BASE}/media/${trimmed.slice(SUPABASE_MEDIA_PREFIX.length)}`
  }

  if (trimmed.startsWith('/media/')) {
    return `${CLOUDINARY_BASE}${trimmed}`
  }

  if (trimmed.startsWith('http')) return trimmed

  return `${CLOUDINARY_BASE}/media/${trimmed}`
}

// Supabase Storage ignores per-object Cache-Control and serves images as
// non-cacheable regardless (github.com/supabase/storage/issues/18). For
// callers that render raw <img>/CSS instead of next/image (which gets its
// own cache layer from Next's image optimizer), route media-bucket URLs
// through our own proxy so we can set Cache-Control ourselves. Now that
// resolveMediaUrl() rewrites everything to Cloudinary (which serves with
// its own CDN caching), this proxy only still applies to SUPABASE_ONLY_PATHS
// — practically, just Office-1.png until that file is migrated too.
export function proxiedMediaUrl(url: string | null | undefined): string {
  const resolved = resolveMediaUrl(url)
  if (!resolved) return ''
  if (resolved.startsWith(MEDIA_BASE)) {
    return `/api/images/${resolved.slice(MEDIA_BASE.length)}`
  }
  return resolved
}
