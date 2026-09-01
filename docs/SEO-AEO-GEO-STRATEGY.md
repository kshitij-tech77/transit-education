# SEO / AEO / GEO Strategy — Transit Education

**Scope:** Full technical SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) audit and strategy for transiteducation.com.np, a Nepali study-abroad consultancy site (Next.js 16 App Router, Supabase-backed custom CMS).

**Audit date:** 2026-09-01. **Audited by:** codebase inspection (direct file reads + two independent Explore passes) and live market research.

---

## 1. Executive Summary

Transit Education's site is **more technically sophisticated than it first appears** — it already has a real CMS-editable content model, per-post E-E-A-T fields on the blog (author credential/bio, fact-check dates, sources), AI-answer "Quick Answer" snippets, FAQPage/Article/BreadcrumbList/LocalBusiness JSON-LD in several places, and a genuinely deep content layer (per-country visa/scholarship/cost/university guides — 9 countries × 4 sub-guides). That is a stronger foundation than most competitors in this vertical have (see §7).

The problem was never a lack of content — it was that **a large share of that content was invisible to search engines**. The single biggest finding of this audit: the sitemap was a static file generated once at build time by `next-sitemap`, which can only discover pages that exist as pre-rendered HTML in the build output. Because three of the site's richest route types (`/locations/[slug]`, `/study-abroad/[slug]`, `/study-abroad/[slug]/[subpage]`) render dynamically from Supabase with no `generateStaticParams`, **all four physical-branch location pages and all ~36 per-country sub-guide pages were completely absent from the sitemap** — verified by diffing the old `public/sitemap-0.xml` (43 URLs) against a live render of the new sitemap (69 URLs). These weren't broken pages; they were fully built, fully linked, fully schema'd pages that Google likely never had a clean discovery path to at scale.

This PR fixes that architecturally (native `sitemap.ts`/`robots.ts` querying Supabase directly, so the sitemap is always in sync with what's actually LIVE) and closes a set of smaller but real gaps: missing `noindex` on not-yet-launched routes, three high-intent calculator tools with zero metadata, thin structured-data coverage, and an Organization schema with no address or social profiles despite that data already existing elsewhere in the codebase.

What this PR deliberately does **not** do: rewrite the four hand-authored country pages (Italy/South Korea/Ireland/New Zealand) that bypass the CMS, fabricate FAQ content, invent reviews/ratings, or restructure the CMS content model. Those are real opportunities but need either a business decision or a content-authoring pass — they're documented in §13 and the companion checklist, not silently done for you.

---

## 2. Current Architecture

**Stack:** Next.js 16.2.4 (App Router, Turbopack, React 19), Tailwind CSS 4, Supabase (Postgres + Auth + Storage) as the data layer and IdP, a custom-built admin CMS at `/cms` (not a third-party headless CMS — despite a `(payload)` route group, Payload CMS is an unused placeholder, see §3.11), Cloudinary for media, TipTap for the blog rich-text editor, `next-themes`, `react-hook-form` + `zod`.

**Route groups:**
- `(frontend)` — the public marketing site (~40 page routes: homepage, about, 5 services, 2 courses, 9 study-abroad country pages + 2 dynamic catch-alls, locations hub + dynamic branch pages, blog hub + dynamic post pages, 3 tools, team, careers, franchise, accreditation, compliance, resources, contact, legal pages).
- `cms` — the real admin CMS (login-gated).
- `(portal)` — an unlaunched student loyalty portal, currently force-redirected to `/` by `src/proxy.ts` unless `PORTAL_ENABLED=true` in the environment.
- `(payload)/admin` — a one-file placeholder ("Will be configured in next iteration"); not the real CMS.
- `api` — ~35 JSON route handlers, mostly `/api/cms/*` powering the admin dashboard.

**Auth/crawl gating happens at the proxy layer, not middleware.ts.** Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (`src/proxy.ts` in this repo) — a real breaking change from this codebase's Next.js version that is easy to miss if you search for the old filename. `src/proxy.ts` gates `/cms/*`, `/api/cms/*`, `/portal*`, and `/api/portal/*`: it checks for a Supabase session and, for CMS routes, a `profiles.role` of `admin`/`editor`. **`/admin/[[...segments]]` (the Payload placeholder) is not in the proxy's matcher and has no auth gating at all** — harmless today because the page has no real functionality, but worth remembering before anything is wired up behind it later.

**Content model** (Supabase tables, each with its own bespoke `/api/cms/*` route — no generic "pages"/blocks type): `blog_posts`, `countries`, `branches`, `faqs`, `resources`, `team_members`, `testimonials`, `success_stories`, `events`, `job_openings`, `job_applications`, `franchise_inquiries`, `students`, `site_settings`, plus a `loyalty/*` group for the unlaunched rewards program. Most public pages read straight from these tables with page-local `unstable_cache` (5-minute revalidate) — there's no repository/service layer, but the pattern is consistent enough to be predictable.

**A genuinely strong, underused asset:** `blog_posts` has real AEO/E-E-A-T fields — `metaTitle`, `metaDescription`, `focusKeyword`, `canonicalUrl`, `authorName`/`authorCredential`/`authorBio` (joined from an `authors` table), `lastReviewed`, `sources[]`, `primaryQuestion`/`answerSummary`/`faqItems[]`, `noindex`. The blog post template (`blog/[slug]/page.tsx`) renders an auto-generated table of contents, a "Quick Answer" GEO snippet block with `speakable` schema, a fact-checked banner, and `Article` + `FAQPage` + `BreadcrumbList` JSON-LD. This is more AEO infrastructure than most sites in this space build — see §7 for how it compares to competitors, none of whom appear to do this.

---

## 3. Technical SEO Audit

### 3.1 Crawlability

- No `middleware.ts`/`proxy.ts` logic blocks crawlers from public routes; the proxy only gates `/cms`, `/api/cms`, `/portal`, `/api/portal` behind auth (see §2).
- `/portal/*` currently 307-redirects to `/` for everyone (not just crawlers) while `PORTAL_ENABLED` is unset — so it isn't really "crawlable" today regardless of robots directives; that will change the day the feature launches.
- `/admin/[[...segments]]` (Payload placeholder) has no auth gate and is a real 200 OK page today; it was relying solely on `robots.txt`/sitemap exclusion, which does not guarantee non-indexing if the URL is ever linked externally. **Fixed in this PR** — see §14.
- API routes (`/api/**`) return JSON, not HTML, so they aren't indexable "pages," but they were never explicitly excluded from crawl budget. **Now disallowed in `robots.ts`.**
- No crawl traps found: no infinite faceted-navigation URLs, no session-ID-in-URL patterns, no infinite pagination without limits.
- No orphan pages found among the audited routes — every route type is reachable from the header/footer nav or a listing page, with the caveat in §11 about inconsistent internal cross-linking between related content.

### 3.2 Indexability

- `robots: {index:false, follow:false}` is set correctly on `/cms/**` (`src/app/cms/layout.tsx`).
- **Gap found and fixed:** `/portal/**` (3 client-component pages, no metadata export at all) and `/admin/[[...segments]]` (metadata existed but no `robots` field) had no defense-in-depth `noindex` — they relied entirely on `robots.txt` disallow + sitemap exclusion, which Google does not treat as a guarantee against indexing a URL discovered any other way. Fixed with a new `(portal)/layout.tsx` and an added `robots` field on the Payload placeholder (§14).
- Dynamic routes (`study-abroad/[slug]`, `study-abroad/[slug]/[subpage]`, `locations/[slug]`, `blog/[slug]`) correctly call `notFound()` for missing/non-LIVE content, which Next.js serves with a genuine 404 status and an implicit noindex.
- No soft-404s found (all "not found" cases go through the real `notFound()` API, not a 200-status "not found" message).
- No duplicate-content risk from routing: the 9 static study-abroad country folders and the dynamic `[slug]` catch-all don't overlap for the same slug (Next.js static routes take priority for exact matches, and the 9 static folders cover exactly the 9 country names that would otherwise hit `[slug]`).
- No query-parameter-driven duplicate content: the blog category filter uses `?category=`, which is fine since there's no unique indexable content behind it (it's a client-side-filterable view of the same list) and it isn't linked with `rel=canonical` variations that would confuse crawlers — though see §11 for the missing dedicated category archive URLs as a content opportunity, not an indexability problem.
- No `trailingSlash`, `i18n`, or `redirects()`/`rewrites()` config in `next.config.ts` — none are needed today (single-locale, and Next's default trailing-slash behavior is consistent).
- **Known gap, not fixed in this PR (needs a decision):** there's no `redirect()` handling for a renamed blog slug or CMS country id — if an editor renames a slug, the old URL 404s instead of 301-redirecting, losing any accumulated link equity. Low current risk (nothing suggests frequent renames happen), documented as a future recommendation.

### 3.3 Sitemap — the core fix in this PR

**Before:** `next-sitemap` (a build-time postbuild script) crawled the *static build output* to discover URLs. That means it could only find:
- All fully static pages (about, services, etc.) — fine.
- Blog posts — fine, because `blog/[slug]/page.tsx` has `generateStaticParams()`.
- The 9 hardcoded study-abroad country folders — fine, they're literally separate static routes.
- **Nothing from `locations/[slug]`** (0 of 4 branches present) or **`study-abroad/[slug]`/`study-abroad/[slug]/[subpage]`** (0 of the CMS-editable country pages or their ~36 visa/scholarship/cost/university sub-guides present) — because none of those routes implement `generateStaticParams`, so no static HTML exists for next-sitemap's crawler to find.
- It also picked up `/icon.png` (a Next.js file-convention route, not a content page) as if it were a real URL, and used flat `priority: 0.7` / `changefreq: daily` for every single page regardless of type.
- The generated `public/sitemap.xml`, `public/sitemap-0.xml`, and `public/robots.txt` were committed to git and regenerated (and re-diffed) on every build — pure noise in version control.

**After:** `src/app/sitemap.ts` — a native Next.js Metadata Route, `revalidate = 300` — queries Supabase directly for LIVE countries, all branches, and published blog posts, and builds their URLs (including all four `visa|scholarships|cost|universities` sub-guides per country) alongside a differentiated static-route list (homepage priority 1.0/daily, country hubs 0.9/weekly, legal pages 0.2/yearly, etc.). This means **the sitemap is always in sync with what's actually LIVE in the CMS** — an editor publishing a new country or branch doesn't require a code change or a redeploy to appear in the sitemap. Verified live: **43 → 69 URLs**, with the 4 previously-missing branch pages and all previously-missing country sub-guides now present (see the implementation checklist for the exact verification commands run).

### 3.4 Robots.txt

Replaced the `next-sitemap`-generated static file with a native `src/app/robots.ts`. Behavior is equivalent for `/cms`, `/admin`, `/portal`, plus two additions: `/api/` (JSON-only, never meant to be crawled) and `/auth/` (the OAuth callback route) are now also disallowed, and the `Sitemap:`/`Host:` directives point at the same `SITE_URL` constant the sitemap uses, so they can never drift out of sync with each other.

### 3.5 Canonical URLs

Broad coverage already existed via `alternates: { canonical: ... }` on essentially every page type. The pattern is 100% hardcoded absolute URLs (`https://transiteducation.com.np/...`) rather than relative paths resolved against Next's `metadataBase` — functionally correct today, but fragile (a typo'd literal string is a silent canonical bug, and there was no `metadataBase` fallback at all for any page that *didn't* set an explicit canonical). **Added `metadataBase` to the root layout** in this PR as a safety net and for new/relative-URL pages (the 3 tools pages added in this PR use it); left the existing hardcoded absolute canonicals alone rather than rewriting ~20 already-correct pages for no functional gain.

### 3.6 Metadata (title/description/OG/Twitter)

This is a real strength of the codebase — the vast majority of pages have unique, intent-matched titles and descriptions (not templated boilerplate), and OpenGraph is broadly covered. Two concrete gaps, both fixed:
- **Twitter Card metadata** was present on only ~4 of the ~30+ metadata-bearing routes (root, homepage, blog posts, and the `study-abroad/[slug]` catch-all). The 8 static country pages that share `getCountryMetadata()` (`src/lib/country-metadata.ts`) and the `locations/[slug]` page had OpenGraph but no `twitter` block. **Fixed** by adding a `twitter: { card: "summary_large_image", ... }` block to the shared helper (covers Canada/USA/UK/Germany automatically) and to `locations/[slug]`.
- **Three tools pages had zero metadata at all** — `/tools/cost-calculator`, `/tools/gpa-converter`, `/tools/ielts-band-calculator` are `"use client"` components with no metadata export, so they inherited the generic site-wide title/description. These are exactly the kind of narrow, high-intent, "how do I convert my NEB percentage to a GPA" pages that answer engines like to cite directly. **Fixed** with a `layout.tsx` per tool carrying unique title/description/canonical/OG.

### 3.7 Structured Data (JSON-LD)

Existing coverage: `Organization` (root layout, sitewide), `FAQPage` (homepage, both study-abroad route families, individual blog posts, all 8 static country pages via `CountryDestinationPage`/hand-authored `Schema` component), `Article` (blog posts), `BreadcrumbList` (blog posts, both study-abroad route families), `LocalBusiness` (each of the 4 branch pages). No `Review`/`AggregateRating` schema exists anywhere — correctly, since the site has no genuine star-rating feature; **do not add this** without a real rating mechanism (see §17).

Gaps found and fixed in this PR:
- **`Organization` schema had no address, `sameAs`, or `areaServed`**, despite that exact data (HQ address, social profile URLs) already being used elsewhere in the codebase (the Kathmandu HQ address on `/locations/kathmandu`, and the same `site_settings`-backed social URLs the footer already renders). Enriched using that same real data — not new claims, just structured markup for facts already published on the site.
- **`FAQPage` schema was missing on About and the Blog hub**, even though both pages already conditionally render a real `FAQAccordion` from the same `faqs` table other pages use for schema. Added, matching the exact pattern already used on the study-abroad pages.
- **`BreadcrumbList` schema was missing on `/locations/[slug]`** despite the visual page having an obvious Home → Locations → Branch hierarchy and every other major content type having it. Added (structured-data only — no visual/layout change).
- **No FAQ structuring at all on Services (5 pages), Compliance, Courses, Tools, Accreditation, or Contact** — Compliance in particular is dense, question-shaped regulatory content (work-hour limits, reporting deadlines, grace periods) that's close to ideal FAQ/AEO material but wasn't in that format anywhere. **Partially addressed**: added the same DB-backed FAQ-fetch-and-render plumbing (matching the `page_path` convention already used by About/Blog/study-abroad) to all 5 Services pages and Compliance, so an editor can now add FAQs for those pages through the CMS UI that already exists and have them render with `FAQPage` schema automatically. No FAQ *content* was invented — the sections simply don't render until real FAQs exist for that `page_path`. See the implementation checklist for the exact `page_path` values used, since content needs to be added through the CMS for this to have a visible effect.

### 3.8 CMS/Portal/Payload — indexability defense-in-depth

Covered in §3.2. Net effect after this PR: `/cms` (noindex meta + robots.txt disallow + sitemap exclusion + proxy auth gate), `/portal` (now has noindex meta + robots.txt disallow + sitemap exclusion + proxy redirect while unlaunched), `/admin` (now has noindex meta + robots.txt disallow + sitemap exclusion — proxy auth gating is a separate, non-SEO recommendation, see §17).

### 3.9 Favicon / App Icons

`src/app/icon.png` is the only icon-convention file present, and it's **non-square (250×150px)** — the site logo reused as-is rather than a dedicated square favicon, which can render oddly in browser tabs and bookmark UIs. No `apple-icon.png`, no `manifest.json`/`manifest.ts`, no `opengraph-image.tsx`/`twitter-image.tsx` file-convention images (all OG images are manually specified as Cloudinary/static URLs per page instead). **Not fixed in this PR** — producing a correctly-cropped square icon and a real web app manifest needs an actual asset decision (crop of the existing logo? a monogram mark? PWA install name/colors?), which is a design/business call, not something to invent silently. Flagged as a near-term recommendation in the checklist.

### 3.10 URL structure / redirects / normalization

No `www` vs non-`www` or `http` vs `https` ambiguity found in the codebase (canonical host is consistently `https://transiteducation.com.np`); actual enforcement (redirecting bare `http://` or `www.` traffic) happens at the hosting/DNS layer, outside this repo — **worth confirming directly in the hosting provider's dashboard** (not verifiable from code). No `trailingSlash` inconsistency. No parameterized-URL duplicate-content risk identified beyond the already-covered blog `?category=` filter.

### 3.11 The Payload CMS route group

`src/app/(payload)/admin/[[...segments]]/page.tsx` is a one-file placeholder ("Payload Admin — Will be configured in next iteration"), not a working integration — the real CMS is the custom-built `/cms`. Its own `(payload)/layout.tsx` renders a second, nested `<html>/<body>` inside the root layout's `<html>/<body>`, which is a structurally unusual pattern worth a look whenever this route is actually built out (not an SEO issue today since the page has no real content to index either way, now that it's noindexed).

---

## 4. AEO Audit (Answer Engine Optimization)

**What's already strong:** the blog's per-post `primaryQuestion`/`answerSummary`/`faqItems` fields plus the rendered "Quick Answer" snippet block and `FAQPage`/`Article` JSON-LD are genuinely good AEO infrastructure — this is the kind of structure that lets an LLM lift a direct, attributable answer instead of having to summarize a whole page. The per-country `visa/scholarships/cost/universities` sub-guides are similarly well-suited: they answer one narrow, well-defined question each ("What's the cost of studying in Germany?") with specific numbers, not marketing copy.

**What's missing:** everything not on the blog or a study-abroad country page is written as marketing/service copy, not as direct answers to the questions a prospective student (or an AI answering on their behalf) would actually ask:
- Services pages describe *what Transit offers*, not *how the process works* or *what the answer to a specific question is* — e.g. "How long does a Canada student visa take from Nepal?" is answered inside the `study-abroad/canada/visa` sub-guide, but not surfaced anywhere near the Student Visa Service page itself.
- Compliance is the single most FAQ-shaped page on the site (visa work-hour limits, SEVIS reporting deadlines, grace periods, enrollment minimums, country-by-country rules) and had zero FAQ/QA structuring — now has the plumbing to support it (§3.7), pending real FAQ authoring.
- The Team page shows name/role/branch/photo only — no bios, no credentials, no years of experience — even though the blog's `authors` table already models exactly that data (`credential`, `bio`) and the Team page's own meta description claims "certified counsellors." An AI trying to establish who specifically is qualified to give this advice has nothing to go on beyond the blog author boxes.
- No standalone, indexable Success Stories or Testimonials page — both `success_stories` and `testimonials` are real CMS content types with genuine outcome data (student name, destination, year, approval), shown only as homepage carousel snippets. That's citable proof-of-outcome content sitting in the database with no URL of its own.

**Recommendation, not implemented (needs content work):** turn Compliance's existing rule-lists into an actual FAQ set (the content already exists in prose form — it needs to be re-authored as question/answer pairs and entered via the CMS, which now has somewhere to render them). Same for a handful of the most common services questions ("How much does admission counselling cost?", "How long does SOP writing take?").

---

## 5. GEO Audit (Generative Engine Optimization)

**Entity clarity** — can a model answer "who is Transit Education, what do they do, who do they serve, where do they operate" purely from the site? Mostly yes: About and the homepage state the mission clearly, Accreditation lists real, specific, dated credentials (ICEF, Education UK/British Council, QEAC, USATC/ACEC, NZEAC, "since 2015"), and Contact/Locations give real addresses and phone numbers for 4 branches. The gap is that this entity information isn't reinforced in structured data as strongly as it could be — the Organization schema (now enriched, §3.7) is the main sitewide signal, and it's the right place for `sameAs` links so a model can cross-reference the same entity across the site's own social profiles.

**Authority signals** — the blog's E-E-A-T fields (author credential/bio, fact-check/last-reviewed date, sources list) are the strongest authority signal on the site and are already GEO-appropriate (specific, dated, sourced claims are exactly what generative engines weight for citation-worthiness). This strength doesn't extend to Team, Services, or Compliance, where claims like "certified counsellors" or "98% visa success rate" appear without an attributable source or a name attached elsewhere on the site (see §17 on why not to *invent* a source, only to *point to one you already have* if it exists).

**Content architecture** — the site already has a workable pillar structure for study-abroad specifically: Country hub → Visa/Scholarships/Cost/Universities sub-guides → FAQs, cross-linked via a sidebar on each sub-guide. That pattern doesn't exist for the Services side of the business (Admission Counselling, Visa Service, Test Prep, Scholarships, SOP Writing all sit as flat, unconnected pages with no shared "supporting content" layer) — see §12 for a recommended architecture.

---

## 6. Local SEO Audit

Transit Education has 4 real physical branches (Kathmandu HQ/Bagbazar, Itahari, Damak, Damauli) — a genuine local-SEO asset, not a franchise-doorway-page situation. Each branch page (`/locations/[slug]`) already has address, phone, WhatsApp, email, hours, and `LocalBusiness` JSON-LD — solid groundwork. Findings:

- **NAP data lives in three independently-maintained places**: the `branches` Supabase table (used for nav/footer), a hardcoded `BRANCHES` array in `locations/page.tsx`, and a separate hardcoded `locationsData` object in `locations/[slug]/page.tsx` (address, phone, hours, FAQs, testimonials). A phone number change requires an editor to remember to update it in three places, or NAP consistency silently drifts — a directly negative local-SEO signal if it happens. **Not fixed in this PR** (a real data-model consolidation, out of scope for a technical-SEO pass) but flagged as the top local-SEO code-quality issue.
- **Content depth is uneven across branches** — Kathmandu has 4 "why choose us" points, 3 testimonials, 3 FAQs; Damak/Damauli have thinner content (fewer testimonials, in Damauli's case zero). This is a real AEO/local-SEO gap for the secondary branches specifically, and needs branch-specific content (real testimonials, real local detail) rather than templated filler.
- **The sitemap gap in §3.3 was actively hiding all 4 branch pages from search** — now fixed, but worth stating plainly: this was probably the single highest-impact local-SEO bug on the site before this PR, since it meant none of these pages had a reliable discovery path regardless of their content quality.
- **Contact page's embedded Google Map only shows the Kathmandu office**, even though the page copy says "4 branches... we'll connect you instantly" — a minor content/UX mismatch for a non-Kathmandu visitor, not fixed in this PR (a design decision: multiple embeds vs. a branch picker).
- No Google Business Profile / Maps data is inspectable from the codebase — verify GBP listings exist and are claimed for all 4 branches directly in Google Business Profile Manager (outside this repo's visibility).

---

## 7. Competitor & Market Research

Researched via live web search (2026-09-01). Nepal's study-abroad consultancy market includes: **KIEC**, **AECC Global Nepal**, **IDP Nepal**, **Expert Education Nepal**, **Studylane**, **CAN Consultancy**, **CIC Education Hub**, **Edwise Foundation**, **NIEC** — most claiming 15-20+ years of operation and double-digit branch counts (KIEC alone claims 16+ locations vs. Transit's 4).

A direct content audit of KIEC's homepage (the most established competitor) found: strong destination-country coverage (12 countries listed vs. Transit's 9), heavy emphasis on accreditation badges and headline stats ("20+ years", "97% success rate", "16 branches", "188 university partnerships"), extensive testimonial carousels — but **no FAQ section at all**, and no visible AEO structuring (no quick-answer blocks, no per-post fact-checking, no visible schema depth beyond the basics). That's a genuine opening: none of the researched competitors appear to be building the kind of structured, citable, AI-answerable content Transit's blog already has a head start on.

**Where competitors are ahead:** raw branch count and years-in-business as trust signals, broader destination-country lists (some include Japan, Denmark, France, Malaysia, Thailand, UAE — Transit's copy occasionally mentions Japan and a blog post exists about Finland, but neither has a dedicated country page, see §9), and generally louder stat-driven homepages.

**Where Transit can differentiate rather than copy:** none of the researched competitors appear to publish structured, sourced, fact-checked content at the level Transit's blog schema already supports. The winning move is not to out-brag on stats, but to make the existing AEO infrastructure (Quick Answer blocks, sourced claims, dated fact-checks) actually comprehensive across Services and Compliance too — becoming the site that AI answer engines can most confidently cite for "how does a Canada study permit work from Nepal" specifically, rather than competing purely on "which consultancy is biggest."

---

## 8. Keyword / Search-Intent Research & Content Gaps

Prioritizing business value + achievable authority over raw search volume, per the brief. High-value clusters already reasonably well covered: `study in canada from nepal`, `canada student visa nepal`, `ielts pte preparation nepal`, `scholarships in [country] for nepali students`, `cost of studying in [country]`. Real gaps, ranked by estimated leverage:

| Topic | Intent | Business value | Existing page | Recommended action |
|---|---|---|---:|---|
| Compliance content re-authored as FAQ/QA pairs | Informational, high AEO value | High — reduces support load, strong citation bait | `/compliance` (rule-list format) | Content task: convert to Q&A, use the FAQ plumbing added in this PR |
| Team member bios/credentials | Trust/E-E-A-T | High — directly supports "who is qualified to advise me" | `/team` (name/photo only) | Content task: surface existing `authors`-style bio data on `/team` |
| Standalone Success Stories / Testimonials pages | Proof-of-outcome, informational | Medium-high — indexable proof content | Homepage carousel only | Build a real `/success-stories` page from the existing CMS table |
| Finland / Japan country coverage | Informational, some commercial | Medium — a blog post and marketing copy already reference these countries with no landing page | Orphaned blog post (`10-reasons-why-finland-is-the-best-destination...`), Japan mentioned only in branch copy | Business decision: either add these as real destinations (if Transit actually places students there) or stop referencing them in copy/blog to avoid an unsupported claim |
| Services-page FAQ content | Commercial/informational | Medium | 5 Services pages (plumbing added, no content yet) | Content task: author real Q&A per service |
| Category/tag archive pages for the blog | Informational | Low-medium | `/blog?category=` (filtered view, not a real archive URL) | Consider dedicated `/blog/category/[slug]` routes if blog volume grows enough to need them — not urgent at current post count |

---

## 9. Entity Strategy

The core entity is unambiguous — "Transit Education," a study-abroad consultancy headquartered in Kathmandu with 3 additional branches, serving Nepali students applying to 9 named destination countries. The Organization schema enrichment in this PR (§3.7) strengthens the machine-readable version of that entity. Two things would strengthen it further without any fabrication: (1) `Person` schema or at least consistent bio data for named counsellors/leadership (ties into §4's Team gap), and (2) resolving the Finland/Japan inconsistency in §8 so the entity's claimed service area is internally consistent across every page that mentions it.

## 10. Internal Linking Strategy

Header/footer navigation is comprehensive and mostly DB-driven (study-abroad and locations menus pull live from `countries`/`branches`). Gaps: the shared `Breadcrumb` component exists and renders well but is used inconsistently (present on Services and study-abroad pages, absent on Locations until this PR's schema-only addition, absent on Team/Contact/Tools/Courses/Careers/Franchise); blog "Related Articles" is same-category-agnostic (just excludes the current post, not an actual relevance match); and there's no cross-linking from a country page to relevant blog posts about that country, or from a Services page to the country pages most relevant to that service. None of this is fixed in this PR (a content/IA pass, not a technical-SEO bug) but is the natural next investment once the FAQ content in §8 exists to link to.

## 11. Content Architecture — Recommended

Adopt the pattern the study-abroad section already proves works, and extend it to Services:

```
Service (e.g. Student Visa Service)
  └─ Country-specific visa guide links (already exist at /study-abroad/{country}/visa — just link to them)
  └─ FAQ (plumbing added this PR — needs content)
  └─ Related blog posts (needs a real relevance query, not just "not this post")

Country (e.g. Canada)
  └─ Visa | Scholarships | Cost | Universities (already exists)
  └─ FAQ (already exists)
  └─ Related blog posts about that country (does not exist — recommended)

Compliance
  └─ FAQ per country tab (plumbing added this PR — needs re-authored content)
```

Prefer linking existing deep content across sections over building new pages — the study-abroad sub-guides already answer most of what a Services page's FAQ would otherwise need to duplicate.

## 12. Prioritized Opportunities

See the companion `docs/SEO-IMPLEMENTATION-CHECKLIST.md` for the full implemented/recommended/needs-input breakdown with effort estimates.

## 13. Measurement / KPI Framework

Recommended tracking (requires accounts this repo can't provision):
- **Google Search Console** (verify domain if not already; not inspectable from code) — monitor sitemap coverage before/after this PR specifically (43 → 69 submitted URLs is directly verifiable there within days of deploy), track impressions/clicks for the newly-indexable location and country-subpage URLs.
- **Core Web Vitals** via Search Console/PageSpeed Insights — not deeply audited in this pass (out of scope: no Lighthouse run performed here); worth a follow-up pass.
- Blog: track which posts' `FAQPage`/`Article` schema get "rich result" eligibility in Search Console.
- AI-answer visibility (ChatGPT/Perplexity/Gemini/AI Overviews citing Transit) has no first-party measurement tool — track manually by periodically asking these tools the target questions from §8 and noting whether/how Transit is cited.

## 14. What This PR Implements

See `docs/SEO-IMPLEMENTATION-CHECKLIST.md` for the exact file-level list. Summary: native dynamic `sitemap.ts`/`robots.ts` (replacing `next-sitemap`), `metadataBase` + enriched Organization schema, `noindex` on the portal and Payload admin stubs, metadata for the 3 tools pages, Twitter Card coverage for all country/location pages, `FAQPage` schema on About/Blog, `BreadcrumbList` schema on location pages, and FAQ-rendering plumbing (schema + UI, no invented content) on all 5 Services pages and Compliance.

## 15. Future Content Roadmap

1. Author real FAQ content for Compliance and the 5 Services pages via the CMS (plumbing is ready).
2. Build a real `/success-stories` (or `/testimonials`) indexable page from the existing CMS tables.
3. Surface team member bios/credentials on `/team`.
4. Resolve the Finland/Japan destination-copy inconsistency (§8) — business decision.
5. Consolidate the 3 sources of branch NAP data into one (data-model work, not content).
6. Decide the fate of the 4 CMS-bypassing static country pages (Italy/South Korea/Ireland/New Zealand) — see the checklist for why this needs a data-verification step before any code change.
7. Produce a real square favicon + web app manifest.
8. Add relevance-based (not just "not this post") related-content linking between blog posts, country pages, and services.

## 16. Risks & What We Deliberately Did Not Do

- **Did not** touch the 4 hand-authored country pages' rendering/metadata logic (Italy/South Korea/Ireland/New Zealand) — swapping their metadata to the CMS-aware `getCountryMetadata()` helper without first confirming matching `countries` rows exist and are `LIVE` in the database could have silently `noindex`'d fully live pages. This needs a data check against the production database before any code change, not a guess from this repo.
- **Did not** fabricate FAQ content, reviews, ratings, credentials, or statistics anywhere. Every structured-data field added in this PR uses data that already exists elsewhere in the codebase (site_settings social URLs, the published Kathmandu HQ address).
- **Did not** rewrite ~20 already-correct hardcoded canonical URLs to use relative paths + `metadataBase` — functionally unnecessary churn on working code.
- **Did not** consolidate the 3 branch-NAP data sources — real value, but a data-model change that deserves its own review, not a rider on an SEO PR.
- **Did not** attempt Core Web Vitals/performance remediation — out of scope for this technical-SEO pass; flagged as a follow-up.
- **Did not** create new location/doorway pages, or add countries/branches that don't have real underlying operations.
