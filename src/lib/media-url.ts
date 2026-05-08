const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

// Converts both URL formats to a valid public URL:
//   /media/2025/02/image.png  →  https://*.supabase.co/storage/v1/object/public/media/2025/02/image.png
//   https://...               →  returned as-is
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/media/')) {
    return `${SUPABASE_URL}/storage/v1/object/public/media/${url.slice('/media/'.length)}`
  }
  return url
}
