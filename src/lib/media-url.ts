import { CLOUDINARY_BASE } from "@/constants/assets"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_MEDIA_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/media/`
const CLOUDINARY_MEDIA_PREFIX = `${CLOUDINARY_BASE}/media/`

// Temporary workaround: too large for Cloudinary's free-tier upload limit,
// so this file stays Supabase-only. Remove once it's compressed/re-uploaded
// or the plan limit is addressed.
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

  const mediaPath = extractMediaPath(url)
  if (mediaPath && SUPABASE_ONLY_PATHS.includes(mediaPath)) {
    return `${SUPABASE_MEDIA_PREFIX}${mediaPath}`
  }

  // Guard against the empty-string fallback in CLOUDINARY_BASE: `"".startsWith("")`
  // is true for every string, which would otherwise make this branch swallow
  // every URL as a silent passthrough if the env var were ever unset.
  if (CLOUDINARY_BASE && url.startsWith(CLOUDINARY_BASE)) return url

  if (url.startsWith(SUPABASE_MEDIA_PREFIX)) {
    return `${CLOUDINARY_BASE}/media/${url.slice(SUPABASE_MEDIA_PREFIX.length)}`
  }

  if (url.startsWith('/media/')) {
    return `${CLOUDINARY_BASE}${url}`
  }

  if (url.startsWith('http')) return url

  return `${CLOUDINARY_BASE}/media/${url}`
}
