import { MEDIA_BASE } from "@/constants/assets"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

// Converts both URL formats to a valid public URL:
//   /media/2025/02/image.png  →  https://*.supabase.co/storage/v1/object/public/media/2025/02/image.png
//   https://...               →  returned as-is
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('http')) return trimmed
  if (trimmed.startsWith('/media/')) {
    return `${SUPABASE_URL}/storage/v1/object/public/media/${trimmed.slice('/media/'.length)}`
  }
  return trimmed
}

// Supabase Storage ignores per-object Cache-Control and serves images as
// non-cacheable regardless (github.com/supabase/storage/issues/18). For
// callers that render raw <img>/CSS instead of next/image (which gets its
// own cache layer from Next's image optimizer), route media-bucket URLs
// through our own proxy so we can set Cache-Control ourselves.
export function proxiedMediaUrl(url: string | null | undefined): string {
  const resolved = resolveMediaUrl(url)
  if (!resolved) return ''
  if (resolved.startsWith(MEDIA_BASE)) {
    return `/api/images/${resolved.slice(MEDIA_BASE.length)}`
  }
  return resolved
}
