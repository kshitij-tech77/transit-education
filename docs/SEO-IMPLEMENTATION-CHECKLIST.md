# SEO Implementation Checklist

Companion to `docs/SEO-AEO-GEO-STRATEGY.md`. Verified against a production build (`npm run build && npm run start`) on 2026-09-01.

## ✅ Implemented in this PR

| Change | Files | Why |
|---|---|---|
| Native dynamic sitemap querying Supabase directly (countries, branches, blog posts) | `src/app/sitemap.ts` (new) | Old `next-sitemap` build-time crawl only found static HTML; missed all 4 branch pages and ~36 country sub-guide pages. Verified live: **43 → 69 URLs**. |
| Native `robots.txt` route, in sync with the sitemap's `SITE_URL` | `src/app/robots.ts` (new) | Replaces the `next-sitemap`-generated static file; adds `/api/` and `/auth/` to disallow. |
| Removed `next-sitemap` entirely | `package.json`, `package-lock.json`, deleted `next-sitemap.config.js`, deleted `public/{robots.txt,sitemap.xml,sitemap-0.xml}` | Those files conflict with the new native routes and were pure build-artifact noise in git history. |
| Shared `SITE_URL` constant | `src/lib/site-url.ts` (new) | Single source of truth for the sitemap, robots, and root `metadataBase`. |
| Shared branch-slug helper (dedupes logic that existed only in the layout before) | `src/lib/branch-slug.ts` (new), `src/app/(frontend)/layout.tsx` | Needed identical slug derivation in `sitemap.ts`; extracted rather than duplicated inline. |
| `metadataBase` on the root layout | `src/app/layout.tsx` | Safety net for any page not setting an explicit absolute canonical/OG URL (the 3 new tools pages use it). |
| Organization JSON-LD enriched with address + `sameAs` | `src/app/layout.tsx` | Used data that already exists elsewhere (Kathmandu HQ address on `/locations/kathmandu`, `site_settings` social URLs the footer already renders) — no new claims. |
| `noindex` on the unlaunched student portal | `src/app/(portal)/layout.tsx` (new) | Portal pages were client components with zero metadata; relied solely on robots.txt/sitemap exclusion. Defense-in-depth for when `PORTAL_ENABLED=true` ships. |
| `noindex` on the Payload admin placeholder | `src/app/(payload)/admin/[[...segments]]/page.tsx` | Same gap — and this route has **no** proxy-level auth gating at all today, so this was the only protection available. |
| Metadata (title/description/canonical/OG) for all 3 calculator tools | `src/app/(frontend)/tools/{cost-calculator,gpa-converter,ielts-band-calculator}/layout.tsx` (new) | These were `"use client"` pages with zero metadata, inheriting the generic homepage title/description. High-intent, narrow-question pages — good AEO candidates. |
| Twitter Card metadata for all 8 static country pages + all location pages | `src/lib/country-metadata.ts`, `src/app/(frontend)/locations/[slug]/page.tsx` | Was present on only ~4 route types sitewide. |
| `FAQPage` JSON-LD on About and Blog hub | `src/app/(frontend)/about/page.tsx`, `src/app/(frontend)/blog/page.tsx` | Both already render a real DB-backed `FAQAccordion`; schema was simply missing. |
| `BreadcrumbList` JSON-LD on branch location pages | `src/app/(frontend)/locations/[slug]/page.tsx` | Structured-data-only addition (no visual change) matching the pattern already used on study-abroad pages. |
| FAQ fetch-and-render plumbing (DB-backed, `page_path`-keyed, `FAQPage` schema) added to 5 Services pages + Compliance | `src/app/(frontend)/services/{admission-counselling,student-visa-service,test-preparation,scholarships-assistance,sop-writing}/page.tsx`, `src/app/(frontend)/compliance/page.tsx` | Extends the exact same pattern already used on About/Blog/study-abroad to the pages most in need of AEO structuring. **No FAQ content was invented** — sections render only if real rows exist for that `page_path`. |

### `page_path` values now supported (for content authors adding FAQs via the CMS)

`services/admission-counselling`, `services/student-visa-service`, `services/test-preparation`, `services/scholarships-assistance`, `services/sop-writing`, `compliance`

### Validation performed

- `npx tsc --noEmit` — clean, no errors.
- `npm run lint` — **358 problems (162 errors, 196 warnings) before and after this PR, identical count** (verified via `git stash`/`git stash pop`) — every existing issue is pre-existing in code this PR didn't touch; zero new lint issues introduced.
- `npm run build` — succeeds; `/robots.txt` and `/sitemap.xml` both appear in the route table as prerendered-with-revalidate routes.
- `npm run start` on a built production server, then verified with `curl` against the live server:
  - `/robots.txt` renders with the expected disallow rules and `Sitemap:`/`Host:` pointing at `transiteducation.com.np`.
  - `/sitemap.xml` renders 69 `<loc>` entries (up from 43), including all 4 `/locations/{kathmandu,itahari,damak,damauli}` and all `/study-abroad/canada/{visa,scholarships,cost,universities}`-style sub-guide URLs.
  - `/tools/cost-calculator` renders the new unique `<title>`, `<meta name="description">`, and `<meta name="robots" content="index, follow">`.
  - `/portal` returns `307` and redirects to `/` (confirms the existing `proxy.ts` gate still works unchanged; the new `noindex` is defense-in-depth for after launch).
  - `/admin` now renders `<meta name="robots" content="noindex, nofollow">`.
  - Homepage JSON-LD now includes the enriched `address`/`sameAs` Organization fields.
  - `/locations/kathmandu` now includes `BreadcrumbList` JSON-LD.
  - Spot-checked 200 OK on `/`, `/services/admission-counselling`, all 3 tools pages, `/compliance`, `/locations/kathmandu`, `/study-abroad/canada/visa`, `/blog` — no regressions.

## 📋 Recommended but not implemented (needs a follow-up PR)

- Author real FAQ content for the 5 Services pages and Compliance through the CMS (the rendering plumbing is ready and waiting for rows in `faqs`).
- Build a standalone, indexable `/success-stories` and/or `/testimonials` page from the existing `success_stories`/`testimonials` CMS tables.
- Surface team member bios/credentials on `/team` (the data shape already exists on the blog's `authors` table — needs an equivalent for team members, or a shared table).
- Consolidate the 3 independently-maintained sources of branch NAP data (`branches` table, `locations/page.tsx`'s hardcoded array, `locations/[slug]/page.tsx`'s hardcoded object) into one source of truth.
- Add relevance-based related-content linking (blog ↔ country pages ↔ services) instead of the current same-category-agnostic "not this post" logic.
- Produce a real square favicon + `manifest.ts` (current `icon.png` is 250×150, non-square).
- Add `redirect()` handling for renamed blog slugs / CMS country ids so old URLs 301 instead of 404ing.
- Consistent `Breadcrumb` component usage across Team/Contact/Tools/Courses/Careers/Franchise (currently only on Services + study-abroad + now Locations schema).

## 🔒 Requires content/business input before any code change

- **The 4 hand-authored static country pages (Italy, South Korea, Ireland, New Zealand)** bypass the CMS entirely — an editor's changes to those countries in the admin dashboard have zero effect on the live page. The fix (switching their metadata to the CMS-aware `getCountryMetadata()` helper, or migrating them to the same `CountryDestinationPage` component the other 5 countries use) requires **first confirming matching `countries` rows exist and are `status = 'LIVE'`** in the production database with equivalent content — doing this blind risks silently `noindex`-ing four fully live pages that currently rank. Needs a database check, then a decision: migrate to CMS-driven, or keep them intentionally hand-authored and just document why.
- **The Finland/Japan destination inconsistency**: a blog post exists ("10 reasons why Finland is the best destination...") and branch marketing copy mentions Japan as a partner country, but neither has a `/study-abroad/{country}` landing page. Business decision: are these real, active destinations Transit places students in? If yes, build the pages; if no, the existing copy should be corrected to avoid an unsupported claim.
- **Google Business Profile verification for all 4 branches** — not inspectable from this codebase; verify directly in Google Business Profile Manager.
- **`http`→`https` and `www`→non-`www` canonicalization enforcement** — likely handled at the hosting/DNS layer, outside this repository; confirm directly with the hosting provider.

## 🧰 Requires external tools/accounts

- Google Search Console — verify sitemap re-submission and monitor indexed-URL count climbing from the pre-PR baseline.
- Core Web Vitals / Lighthouse pass — not performed in this audit (out of scope); recommended as a dedicated follow-up.
- Manual periodic checks of ChatGPT/Perplexity/Gemini/AI Overviews for the target questions in the strategy doc's §8 keyword table, to track AI-citation visibility (no first-party tooling exists for this).

## 🔭 Future opportunities (longer-term, not urgent)

- Dedicated `/blog/category/[slug]` archive routes if post volume grows enough to need them (current volume is well served by the existing `?category=` filter).
- Expand the study-abroad → services cross-linking pattern described in the strategy doc's §11 content architecture.
- Consider `Person` schema for named leadership/counsellors once bios exist.
