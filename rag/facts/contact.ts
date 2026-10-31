/** Human hand-off details. Mirrors the site's existing WhatsApp CTA. */
export const WHATSAPP_NUMBER = '9779851315991';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const CONTACT_PATH = '/contact';
export const SITE_ORIGIN = 'https://www.transiteducation.com.np';

/** Absolute URL for a stored site-relative path (chunks store relative URLs). */
export function absoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}
