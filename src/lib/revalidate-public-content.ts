import { revalidatePath, revalidateTag } from 'next/cache';

type PublicContentTag =
  | 'faqs'
  | 'team-members'
  | 'testimonials'
  | 'success-stories'
  | 'site-settings'
  | 'countries'
  | 'branches'
  | 'events';

// Called only after successful CMS writes. Expire tagged data before the next
// page render, including shared navigation/footer data. Keep timed revalidation
// as a fallback for out-of-band edits and automatic event expiry.
export function revalidatePublicContent(tag: PublicContentTag) {
  revalidateTag(tag, { expire: 0 });
  revalidatePath('/');
  if (tag === 'countries' || tag === 'branches') {
    revalidatePath('/sitemap.xml');
  }
  // Team cards include branch names in their cached query result.
  if (tag === 'branches') {
    revalidateTag('team-members', { expire: 0 });
  }
}
