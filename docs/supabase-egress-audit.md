# Supabase Egress Architecture Audit

**Scope:** Full-codebase audit of Supabase Storage usage, image delivery, and bandwidth/egress sources ahead of hitting the Free Tier Cached Egress limit.
**Constraint on this report:** Investigation only. No code was changed. All findings below are traceable to specific files/lines in this repository as of the current `loyalty-portal-ui` branch (base `main`).

---

## 1. Executive Summary

The site is a single Next.js 16 app (App Router) backed by one Supabase project providing Postgres, Auth, and Storage. There is **exactly one public image bucket (`media`)** and **one separate upload bucket for job-application CVs (`career-uploads`)** — no other buckets exist in code.

Two prior optimization passes have already happened on this branch's history:
1. **Cache-Control workaround** ([`b29a665`](#)) — added `/api/images/[...path]/route.ts`, a same-origin proxy that fetches from Supabase Storage and re-serves the bytes with `Cache-Control: public, max-age=31536000, immutable`, because Supabase Storage does not honor per-object `Cache-Control` for public GETs ([supabase/storage#18](https://github.com/supabase/storage/issues/18), cited in code comments).
2. **One-time image compression + WebP migration** ([`96ea989`](#)) — re-uploaded oversized images to Storage and repointed hardcoded URLs. This was a manual, one-off pass, not a runtime pipeline (no `sharp` or image-processing dependency exists in `package.json`).

**The critical open question this audit surfaces, and the one the free-tier alarm actually hinges on, is Finding F1 below: whether the `/api/images` proxy is actually being cached at the CDN/edge layer.** If it is not, the proxy has added a hop but **has not reduced Supabase egress at all** — every visitor's image request still round-trips through the proxy to Supabase Storage on every page load, because Route Handler responses are not automatically edge-cached without either static generation, an explicit `fetch()` cache directive, or a hosting-provider CDN rule. There is no hosting config in this repo (no `vercel.json`) that confirms this either way — it must be verified against the actual deployment.

Separately, this audit found **9 unproxied `<img>` tags** that bypass the cache-control workaround entirely (2 already fixed in the loyalty portal this session; 7 remain in CMS admin views — see [Section 6](#6-codebase-findings)). Each of those is a guaranteed non-cached hit to Supabase Storage on every render.

**Recommendation preview** (justified in full in Section 9): do **not** migrate storage providers yet. The evidence points to a caching/config gap, not a provider-capacity gap — every candidate replacement (R2, Cloudinary, ImageKit, BunnyCDN) has the exact same "non-cacheable at origin" problem unless fronted by a CDN, which is precisely the piece that's currently unverified for Supabase too. Fix and verify the caching layer first; that alone may resolve the egress pressure. Migration is a fallback, not a first move.

---

## 2. Current Architecture

### 2.1 System Overview
- **Framework:** Next.js 16.2.4 (App Router), React 19.2.4, deployed from a GitHub repo (`kshitij-tech77/transit-education`). No `vercel.json`/`netlify.toml`/`Dockerfile` found in the repo — hosting provider and its CDN behavior are **not confirmed by code** (see [Unknowns](#12-questions-and-unknowns)).
- **Backend-as-a-service:** Supabase — Postgres (24 tables per `supabase/schema.sql`), Auth (`@supabase/ssr`, cookie-based sessions for the CMS), Storage (2 buckets), no Edge Functions found anywhere in the repo.
- **Three Supabase client entry points** ([graphify-out/GRAPH_REPORT.md](../graphify-out/GRAPH_REPORT.md) — `createClient()` is the #2 "god node" at 46 edges):
  - `src/lib/supabase.ts` — browser anon client.
  - `src/lib/supabase-server.ts` — server component / route handler client, cookie-bound (used by `serviceClient()` per the graph report's inferred edge `serviceClient() → createClient()`).
  - `src/lib/supabase-admin.ts` — service-role client for privileged CMS operations (media upload/delete).
- **Auth/routing gate:** `src/proxy.ts` (Next.js middleware) — gates `/cms/*` and `/api/cms/*` behind a Supabase session, with an explicit allowlist of public GET/POST CMS endpoints (success-stories, countries, settings, events, job-openings reads; student/job-application/franchise-inquiry writes).

### 2.2 Storage Architecture
- Bucket **`media`** — public, holds all CMS-managed marketing/blog/portal imagery. Path convention: `<bucket>/<year>/<month>/<filename>`, e.g. `media/2026/04/Transit-ktm-1.webp`. Bucket name and base URL are centralized in `src/constants/assets.ts` (`MEDIA_BUCKET`, `STORAGE_BASE`, `MEDIA_BASE`).
- Bucket **`career-uploads`** — used only in `src/app/(frontend)/careers/CareersClient.tsx:71`, uploaded to **directly from the browser** using the anon client, storing job-application CVs (PDF/doc). Public/private status is **not determinable from code** — no `getPublicUrl`/`createSignedUrl` call for this bucket exists anywhere; see Finding F2.

### 2.3 Image Architecture
Two parallel rendering paths coexist for the *same* underlying Storage objects:
1. **`next/image` (`<Image>`)** — Next's built-in image optimizer, configured in `next.config.ts` with `remotePatterns` allowing `vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/**`, `minimumCacheTTL: 31536000` (1 year), and AVIF/WebP output formats. This is Next's own caching layer — a *separate* cache from the custom proxy, and it does not go through `/api/images` at all.
2. **Raw `<img>` + `proxiedMediaUrl()`** — for cases needing a plain `<img>` (e.g. non-`fill` layouts, dynamic aspect ratios), `src/lib/media-url.ts` rewrites any URL under `MEDIA_BASE` to `/api/images/<path>`, which is the custom cache-control proxy.

Both paths are legitimate per the project's own convention (confirmed with the user in the prior turn of this session — "instead of going through proxiedMediaUrl() or next/image" was the explicit acceptance bar). The bug class is specifically: **raw `<img src={rawDbValue}>` with neither.**

### 2.4 Upload Pipeline
- **CMS media library:** `src/app/api/cms/media/route.ts` — `POST` validates extension/MIME (`ALLOWED_EXTENSIONS`, `ALLOWED_MIME_TYPES` — graph report's "File Upload Service" community, cohesion 0.39, the single tightest-coupled module in the codebase), sanitizes the filename (`buildSafeName()`), uploads via the service-role client, and returns the storage path. Used by `BlogEditor.tsx` (featured image), `SuccessStoriesSection.tsx`, `EventsSection.tsx` (banner), `MediaLibrarySection.tsx` (general upload).
- **New uploads get a 1-day `Cache-Control`** — per commit `6c90ed0`, not yet confirmed in the file I read directly but referenced in the `backfill-storage-cache-control.ts` script comment ("1 day, matches the conservative first step already agreed on"). This is set as **object metadata on Supabase Storage**, which per the code's own comment (`media-url.ts:18-22`, `api/images/route.ts:4-6`) **Supabase ignores for public-bucket GETs anyway** — this metadata is currently a no-op for cache purposes; the `/api/images` proxy is the only thing actually enforcing a `Cache-Control` header today.
- **Career CVs:** uploaded client-side directly to `career-uploads`, bypassing any server-side validation (no MIME/extension allowlist visible for this path, unlike the media route).
- **One-time/manual scripts** (not part of any runtime request path — irrelevant to *ongoing* egress, but relevant to *how the data got there*): `scripts/migrate-media.ts` (local `public/media/` → Storage bulk upload), `scripts/backfill-storage-cache-control.ts` (re-uploads every object to force new cache-control metadata), `scripts/migrate-to-supabase.ts`, `scripts/export-all-tables.ts`.

### 2.5 Rendering Pipeline
Traced exhaustively in the prior turn of this session (full inventory in [Section 6](#6-codebase-findings)) and re-verified here. Every DB-sourced image field (`photo_url`, `image_url`, `featured_image`, `approval_image_url`, `banner_image`, `avatar_url`, `ceo_photo_url`) funnels through exactly two safe patterns and one unsafe one — see Section 3.

### 2.6 Caching Pipeline
- **Object-level (Supabase):** ineffective for public buckets per the cited GitHub issue — this is *why* the proxy exists at all.
- **`/api/images` proxy** ([`src/app/api/images/[...path]/route.ts`](../src/app/api/images/%5B...path%5D/route.ts)): fetches upstream, sets `Cache-Control: public, max-age=31536000, immutable`, streams the body through. This is a **dynamic Route Handler**, not a static route — whether the response is actually stored at a CDN edge (rather than re-executing the fetch to Supabase on every request) depends entirely on the hosting platform's Route Handler caching behavior, which is unconfirmed (Finding F1).
- **`next/image` optimizer:** Next's own cache, `minimumCacheTTL: 31536000`, independent of the above.
- **Browser cache:** governed by whichever `Cache-Control` header actually reaches the client — see F1 for why this is in question for the proxy path.
- **No CDN config** (Cloudflare, Fastly, Vercel Edge Config) is present in the repo to corroborate any of this at the infrastructure layer.

### 2.7 Database Relationships (image-bearing columns, per `supabase/schema.sql`)
| Table | Column | Line |
|---|---|---|
| `authors` | `photo_url` | 236 |
| `blog_posts` | `featured_image` | 253 |
| `events` | `banner_image` | 338 |
| `job_applications` | `cv_url` | 412 |
| `loyalty_rewards` | `image_url` | 466 |
| `profiles` | `avatar_url` | 519 |
| `success_stories` | `approval_image_url` | 588 |
| `team_members` | `photo_url` | 602 |
| `testimonials` | `photo_url` | 619 |

**Notable gap:** the app reads `settingsRes.data?.ceo_photo_url` from `site_settings` (`src/app/(frontend)/page.tsx:231`, `SettingsSection.tsx:81`), but `site_settings` **as dumped in `supabase/schema.sql:545-556` has no `ceo_*` columns at all**, and none of the 7 migration files in `supabase/migrations/` add them either. This means **`schema.sql` and the migrations folder do not reflect the live database schema** — someone added these columns directly (Supabase Studio, or a migration that was applied and never dumped back). This is a governance gap, not an egress finding, but it means **this repo's SQL files cannot be trusted as the source of truth for a migration plan** — the live schema must be pulled fresh before any Phase 7 work begins.

### 2.8 External Services / Third-Party Dependencies (relevant to egress)
- Google Tag Manager / Analytics (`next.config.ts` CSP allowlist) — client-side, not Supabase egress.
- `images.unsplash.com`, `flagcdn.com`, `i.pravatar.cc` — allowed in both CSP `img-src` and `next.config.ts` `remotePatterns`. These are **already offloaded from Supabase** (third-party-hosted placeholder/flag/avatar images) — zero contribution to Supabase egress.
- `resend` (email), `nodemailer` — unrelated to storage egress.
- No CDN, no image-processing SaaS, no analytics/monitoring SDK that polls Supabase found.

### 2.9 Environment Variables (Supabase-related, names only — no values read)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (implied by `supabase.ts`/`proxy.ts` usage), `SUPABASE_SERVICE_ROLE_KEY` (`supabase-admin.ts`, migration scripts), and — separately — `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF`, which are a **Management API personal access token**, deliberately kept separate from the app's runtime keys, used only by `scripts/check-supabase-usage.ts`.

---

## 3. Image Flow (Traced End-to-End)

```
                    ┌─────────────────────┐
CMS admin uploads → │ POST /api/cms/media  │ → supabase.storage.from("media").upload()
(BlogEditor,        │ (service-role client)│    path: media/<year>/<month>/<safe-name>
Success Stories,    └─────────────────────┘    Cache-Control metadata: 1 day (no-op, see 2.4)
Events banner)
                              │
                              ▼
                   DB row stores RELATIVE path
                   e.g. photo_url = "/media/2026/04/x.webp"
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
   resolveMediaUrl(path)              (raw DB value, unresolved)
   → full https://…supabase.co/…             │
              │                               │
      ┌───────┴────────┐                      ▼
      ▼                ▼              <img src={rawValue}>
 <Image src=…>   proxiedMediaUrl(path)   BROKEN or uncached —
 next/image        → /api/images/…       see Section 6
 optimizer         (custom proxy,
 (own cache,        sets long-lived
 own CDN path)      Cache-Control)
                        │
                        ▼
              fetch(upstream) → Supabase Storage
              egress happens HERE on every
              cache-miss/re-execution (F1)
```

**Answering the brief's specific questions, per image class:**

| Question | `next/image` path | `proxiedMediaUrl` path | Unproxied raw `<img>` (bug) |
|---|---|---|---|
| Uploaded | CMS media API → `media` bucket | same | same |
| Processed | Next.js image optimizer (resize/reformat) at request time | No processing — byte passthrough | No processing |
| Stored | Supabase Storage (`media` bucket) | same | same |
| URL generated | `resolveMediaUrl()` → full Supabase public URL, handed to `<Image>` | `proxiedMediaUrl()` → same-origin `/api/images/...` | Raw DB value, often a bare relative path |
| Rendered | `next/image` | plain `<img>` | plain `<img>` |
| Caching | Next's own optimizer cache, `minimumCacheTTL=1yr` | `Cache-Control` set by the proxy — **if** the proxy response itself is cached (F1) | **None** — every load is a fresh, uncached hit |
| Goes through custom proxy? | No (separate path) | Yes | No |
| Bypasses proxy? | N/A — different mechanism entirely | N/A | **Yes, this is the bug** |

---

## 4. Bandwidth Analysis — Ranked Egress Contributors

| Source | Est. contribution | Evidence |
|---|---:|---|
| **Public marketing image rendering (all pages)** | **High** | Every page in `(frontend)` renders 1-6+ images; homepage alone (`page.tsx`) pulls team photos, testimonials, success stories, CEO photo, blog thumbnails. This is the base load the free tier is presumably already sized around — not itself an anomaly, but the denominator everything else multiplies against. |
| **F1 — proxy cache-hit rate unknown** | **High (if unconfirmed)** | If `/api/images` responses aren't edge-cached, *every* visitor's *every* page view re-fetches from Supabase Storage server-side. This single unknown could be the dominant factor and would explain why a "fix" (adding the proxy) didn't move the needle. |
| **Unproxied `<img>` tags in CMS admin (7 remaining, Section 6)** | **Medium** | Bypasses caching entirely, but admin-only traffic — low request volume vs. public pages. Contribution is real but bounded by how often staff use the CMS. |
| **`next/image` optimizer egress** | **Medium** | Every unique `(url, size, format)` combination Next's optimizer hasn't cached yet requires one Supabase fetch to source the original. First-visit/first-deploy cost, then should flatten — but redeploys and Vercel's optimizer cache eviction policy (not confirmed here) could cause repeated re-fetching. |
| **Search-engine crawlers** | **Medium** | `robots.txt`/`next-sitemap.config.js` allow `/` broadly, disallow only `/cms`, `/admin`. All public pages (including every blog post, every location, every study-abroad country page — all image-heavy) are crawlable, and crawlers do fetch images referenced in `<img>`/OG tags. No rate-limiting or crawler-specific caching found. |
| **CMS `/api/cms/media` GET (media library listing)** | **Low-Medium** | Lists **every object in every year/month folder** on each admin page load (`route.ts:61-99`, three nested `storage.list()` calls per level) — this is a Storage *API* call (metadata), not a download of file bytes, so it's cheap per-call, but it's O(all files) work triggered every time the CMS Media Library tab is opened. |
| **`career-uploads` CV downloads** | **Low** | Bounded by hiring volume; documents are typically small (PDF/docx) relative to images, and download frequency (recruiter opening CVs) is inherently low-volume. |
| **One-time backfill/migration scripts** | **Negligible, non-recurring** | `migrate-media.ts`, `backfill-storage-cache-control.ts` — each downloads+re-uploads the entire bucket once. Real egress event, but a single historical spike, not an ongoing drain. Worth knowing if the free-tier limit was hit *the same billing cycle* one of these ran. |
| **Auth/DB queries (Postgrest)** | **Low** | Postgres row fetches are typically tiny vs. image bytes; not a likely egress driver unless `select('*')` is pulling huge text/jsonb blobs at high frequency — not observed. |
| **Bots / non-crawler scrapers** | **Unknown** | No bot-mitigation (rate limiting, WAF) visible for public routes beyond `src/lib/rate-limit.ts`, whose scope wasn't confirmed to cover image/static routes (it's referenced by `src/app/api/cms/auth/login/route.ts` per the grep in this audit, i.e. login throttling, not image throttling). |

**The single highest-leverage unknown is F1.** Everything else is bounded by traffic patterns that are unlikely to have changed suddenly; a caching regression (or a caching layer that was never actually effective) is the kind of thing that silently inflates every single page view's cost simultaneously.

---

## 5. (see Section 2 — Architecture Review folded in above per repo convention)

---

## 6. Codebase Findings

### 6.1 Full raw-`<img>`-bypass inventory (from this session's live audit)
Two already fixed on this branch (`loyalty-portal-ui`) — wrapped in `proxiedMediaUrl()`:
- ✅ `src/components/portal/RewardsGrid.tsx:52`
- ✅ `src/components/portal/RewardsCarousel.tsx:83`

**Remaining (unfixed, per this session's earlier audit, not modified — no code changes made in this task):**

| # | File:Line | Field | Severity |
|---|---|---|---|
| 1 | `src/components/cms/sections/TestimonialsSection.tsx:67` | `t.photo` (← `photo_url`) | Renders as broken image — value is a bare relative path |
| 2 | `src/components/cms/sections/SuccessStoriesSection.tsx:66` | `s.approvalImage` | Same |
| 3 | `src/components/cms/sections/SuccessStoriesSection.tsx:128` | `editingItem.approvalImage` | Same |
| 4 | `src/components/cms/sections/EventsSection.tsx:135` | `editingItem.banner_image` | Same |
| 5 | `src/components/cms/BlogEditor.tsx:551` | `formData.featuredImage` | Same |
| 6 | `src/components/cms/sections/MediaLibrarySection.tsx:63` | `file.path` | Loads fine (full URL from `getPublicUrl()`), but **skips the cache proxy** — direct, uncached Supabase hit on every CMS Media Library view |
| 7 | `src/components/cms/sections/MediaLibrarySection.tsx:97` | `previewFile.path` | Same as #6 |

All are CMS-admin-only surfaces — lower traffic than public pages, but #6/#7 are hit **every single time any staff member opens the Media Library**, and it's the highest-resolution originals (no Next optimizer resizing), which is a disproportionately expensive pattern for an admin convenience feature.

### 6.2 F2 — `career-uploads` bucket has no confirmed access model
`CareersClient.tsx:70-75` uploads directly from the browser with the **anon** key to a bucket with no `getPublicUrl`/signed-URL call anywhere in the codebase. `cv_url` is stored as `uploadData.path` — a bare relative path, not a URL.

### 6.3 Side-finding — CV links are broken in the CMS (not this task's focus, flagging because it surfaced during the storage audit)
`CareersSection.tsx:119`: `<a href={app.cv_url}>` — `cv_url` is a bare Storage path (e.g. `cv_1234.pdf`), not a full URL (see 6.2). This anchor resolves relative to the current CMS page, not to Storage, so "View CV" almost certainly 404s today. Independent of egress; noted for completeness since it's the same bucket/field this audit was tracing. Not fixed — out of scope for this report.

### 6.4 Schema/migration drift
`site_settings.ceo_photo_url` (and sibling `ceo_*` columns) are read by production code (`page.tsx:231`, `SettingsSection.tsx:81`) but do not exist in `supabase/schema.sql` or any file under `supabase/migrations/`. The SQL in this repo is **not a reliable source of truth** for what's actually live. Any migration plan (Section 10) must start from a fresh `pg_dump`/Studio export, not from these files.

### 6.5 No signed URLs, no private-bucket pattern, anywhere
Confirmed via repo-wide search: zero occurrences of `createSignedUrl`/`createSignedUrls`. Every image is served as a fully public object. This simplifies a potential migration (no auth-on-fetch logic to port) but also means **there is no existing precedent in this codebase for gating image access** — if a future replacement wants signed URLs (e.g., for the CV bucket), that's new code, not a port of existing logic.

---

## 7. Risks

| Risk | Impact | Likelihood |
|---|---|---|
| **Proxy isn't actually cached at the edge (F1)** | Egress reduction from the caching work never materializes; free-tier limit keeps getting hit regardless of any further optimization | Unconfirmed — must verify against live deployment/hosting dashboard before doing anything else |
| **Acting on stale schema files** (6.4) | A migration plan built from `schema.sql` could miss live columns/constraints, causing a broken deploy | Medium — only matters if Phase 7 migration proceeds |
| **`career-uploads` access model unknown** (F2) | If the bucket is public, CVs (PII) are publicly fetchable by anyone with the URL pattern; if migrating storage providers, this bucket needs its own access-control decision, separate from the public `media` bucket | Unconfirmed — needs a dashboard check, not a code fix |
| **CMS Media Library full-bucket `list()` on every view** | Scales linearly with total file count; will get slower and marginally more expensive as the bucket grows, independent of any storage-provider decision | Low today, grows over time |
| **Any storage migration inherits F1 if the *replacement's* CDN isn't verified either** | Migrating providers without first confirming *why* egress is high risks reproducing the exact same problem on a new bill | High if migration is chosen without resolving F1 first |

---

## 8. Alternative Comparison

*Evaluated per the brief's requirement — but see Section 9: the audit's conclusion is that this comparison is premature until F1 is resolved.*

| | **A. Keep Supabase Storage** | **B. Cloudinary** | **C. Cloudflare R2** | **D. ImageKit** | **E. BunnyCDN** |
|---|---|---|---|---|---|
| **Pros** | Zero migration cost; already integrated with existing Auth/RLS/service-role patterns; single vendor | Built-in on-the-fly transforms/CDN; mature DX | No egress fees at all (the specific problem here); S3-compatible API, minimal code change since uploads already go through an S3-like SDK pattern | Real-time image transforms + CDN, generous free tier historically | Extremely cheap storage + CDN pricing, simple API |
| **Cons** | Free-tier egress ceiling is the exact problem being audited; no built-in CDN in front of Storage | Pricing scales fast past free tier; would replace the `next/image` optimizer's job partially, adding redundancy | No built-in image transforms — would lean entirely on `next/image` for resizing, which this repo already does, so not actually a con here | Smaller ecosystem than Cloudinary; another vendor relationship | No image transforms; would still need `next/image` for resizing (again, already the pattern here) |
| **Migration complexity** | None | Medium — rewrite `media-url.ts` helpers, re-upload all objects, update `remotePatterns` | Low-Medium — S3-compatible, upload/list/delete calls are structurally similar to current `supabase.storage` calls; `media-url.ts`/`assets.ts` are already the single choke point for URL construction | Medium | Low-Medium |
| **Est. cost** | $0 until quota breach, then forces plan upgrade | Free tier caps around 25 "credits" (storage+bandwidth+transforms combined); paid tiers commonly start in the $89-99/mo range for meaningful headroom *(public pricing, verify current figures before deciding)* | No egress fee; storage ~$0.015/GB-mo *(verify current rate)* — likely the cheapest at this traffic scale specifically because egress, not storage, is the constraint being hit | Free tier historically ~20GB bandwidth/mo, paid plans from ~$49/mo *(verify)* | Pay-as-you-go, historically ~$0.01-0.06/GB egress by region + ~$0.01/GB-mo storage *(verify)* — no monthly minimum, good fit for unpredictable traffic |
| **Performance** | Unknown without CDN confirmation (F1) | Strong — global CDN, edge transforms | Strong — Cloudflare's network is one of the largest CDNs globally | Strong — CDN + edge transforms | Strong — purpose-built CDN, less feature-rich than the others |
| **CDN quality** | Not confirmed to exist in front of Storage at all — this is the crux of F1 | Excellent | Excellent (Cloudflare) | Good | Good |
| **Developer experience** | Already fully integrated; team is fluent in it | New SDK, new transform syntax to learn | Familiar if team knows S3 API; otherwise a new SDK | New SDK/dashboard | Simple API, minimal learning curve |
| **Scalability** | Fine on Postgres/Auth; Storage free-tier ceiling is the constraint in question | Scales, but cost scales with it fast | Scales cheaply — egress-free model matches an image-heavy public site well | Scales, moderate cost growth | Scales, cheap |
| **Risk** | Low risk of *new* bugs (no change); risk is only "problem persists" | Medium — biggest behavioral change (adds a transform layer that may conflict with `next/image`'s own transforms) | Low — closest structural match to current code, S3-compatible | Medium | Low-Medium |

---

## 9. Recommended Path (Not Yet a Migration Decision)

**Do not migrate storage providers based on this audit alone.** The evidence gathered supports a narrower, cheaper, reversible next step:

1. **Resolve F1 first.** Confirm — via the actual hosting dashboard (Vercel/other) and/or by inspecting response headers (`cache-status`, `age`, `x-vercel-cache`, or provider-equivalent) on a real `/api/images/...` request in production — whether the proxy's `Cache-Control` header is resulting in actual edge/CDN caching, or whether every request is silently re-executing the `fetch()` to Supabase. This is a **verification task, zero code changes**, and it directly tells you whether the egress problem is "wrong architecture" or "architecture that was never actually turned on."
2. **Run `npm run check-usage`** (`scripts/check-supabase-usage.ts` already exists, unscheduled) to get the actual current Egress vs. Cached Egress split from Supabase's own Management API. This distinguishes cached-egress pressure (served-from-cache-but-still-counted, which R2/BunnyCDN's "no egress fee" model would genuinely fix) from uncached-egress pressure (which is a caching bug, and would recur on any provider if the same gap in front-end caching is carried over).
3. **Fix the 7 remaining unproxied `<img>` tags** (Section 6.1) — small, safe, same pattern as the two already fixed this session. This is a strict improvement regardless of what Step 1 finds.
4. **Confirm the `career-uploads` bucket's public/private setting** in the Supabase dashboard (F2) — unrelated to egress cost but a possible PII exposure, worth checking in the same sitting.
5. **Only after 1-2 produce a number** (e.g., "60% of egress is uncached, cache-control genuinely isn't landing at the edge") does a provider migration become a data-backed decision — and at that point, **Cloudflare R2** is the strongest candidate on the evidence in Section 8, specifically *because* it removes egress fees as a line item entirely, which is the exact metric under pressure, and because its S3-compatible API is the smallest structural delta from the current `supabase.storage.from(bucket).{upload,list,remove}` call pattern already centralized in `src/lib/media-url.ts` / `src/constants/assets.ts` / `src/app/api/cms/media/route.ts`.

If Step 1 shows the proxy **is** caching correctly and egress is still high, the next suspect is request *volume* (crawlers, redeploy-triggered optimizer cache busts) rather than provider choice — a CDN in front of the existing setup (even a free Cloudflare proxy in front of the Vercel domain) could resolve it without touching Supabase at all.

---

## 10. Migration Plan (Contingent — Only If Step 5 Above Confirms It's Needed)

This is a **design**, per the brief's instruction, not a commitment to execute.

**If R2 is chosen**, the delta is concentrated in a small, already-centralized set of files:

- **Database changes:** None required — DB stores relative paths (`/media/...`) or full URLs depending on table; no schema change needed if the new provider's URL is substituted at the same `resolveMediaUrl()`/`proxiedMediaUrl()` choke point. (Caveat: confirm live schema first per 6.4.)
- **API changes:** `src/app/api/cms/media/route.ts` — swap `supabase.storage.from(BUCKET)` calls for the R2 S3-compatible SDK equivalents (`upload`→`PutObject`, `list`→`ListObjectsV2`, `remove`→`DeleteObject`, `getPublicUrl`→ construct from the R2 public bucket domain or a custom domain).
- **Frontend changes:** `src/lib/media-url.ts` (`SUPABASE_URL`/`MEDIA_BASE` → new base), `src/constants/assets.ts` (`STORAGE_BASE`), `next.config.ts` `remotePatterns` (swap the Supabase hostname for the R2/custom-domain hostname). `/api/images/[...path]/route.ts`'s `MEDIA_BASE` reference updates automatically once `assets.ts` changes — this is the payoff of the choke-point design already in place.
- **Infrastructure changes:** provision R2 bucket + (recommended) a custom domain/Cloudflare CDN in front of it; set new env vars (R2 access key/secret, account ID, bucket name, public base URL).
- **Rollback strategy:** keep `assets.ts`/`media-url.ts` pointed at Supabase behind an env flag until R2 is verified in production for at least one full billing cycle; objects can stay dual-written (upload to both) during a transition window before cutting DB paths over, since the DB stores relative paths, not absolute provider URLs, for most tables — only `Hero.tsx`, `UniversityLogos.tsx`, and the various static hero images in `study-abroad/*`/`services/*`/`courses/*` pages have **hardcoded absolute Supabase URLs** that would need literal string replacement, not just a config change.
- **Testing strategy:** visual diff of every page listed in Section 6/the prior session's audit; verify `next/image` `remotePatterns` update doesn't 403 any still-cached old URLs during the transition.
- **SEO considerations:** image URLs embedded in `sitemap-0.xml`/OG tags (`blog/[slug]/page.tsx:119,130`) reference `post.featured_image` directly — these would need the same base-URL swap or a redirect map to avoid broken OG previews on already-indexed/shared pages.
- **Caching considerations:** this is the whole point — R2 needs the *same* verification (Section 9, Step 1) applied to whatever fronts it, or the migration solves nothing.
- **Security considerations:** confirm R2 bucket public-read policy matches current Supabase public-bucket semantics; separately design an actual access-control decision for the `career-uploads`/CV-equivalent bucket, since today's implementation has no signed-URL precedent to port (6.5).
- **Breaking changes / downtime risk:** low if dual-write + gradual cutover per table is used; the hardcoded-URL pages are the only "flag day" risk since they can't be migrated gradually without a redirect.

---

## 11. Commit-by-Commit Roadmap (If Migration Proceeds)

Each is small, independently testable/deployable, per the brief's requirement:

1. **"Add Supabase usage check to CI/cron"** — wire the existing `scripts/check-supabase-usage.ts` into a scheduled job instead of manual-only. *Files:* CI config or `.github/workflows/`. *Difficulty:* Low. *Risk:* None (read-only).
2. **"Fix remaining unproxied CMS admin image previews"** — apply the same `proxiedMediaUrl()` wrap used in `RewardsGrid.tsx`/`RewardsCarousel.tsx` this session to the 7 files in Section 6.1. *Difficulty:* Low. *Risk:* Low — identical pattern, already proven safe twice.
3. **"Verify and document CDN cache-hit behavior for /api/images"** — no code change; add findings to this doc or a follow-up note. *Difficulty:* Low. *Risk:* None.
4. **(Contingent) "Provision R2 bucket + env vars"** — infra-only, no app code touched yet. *Difficulty:* Low. *Risk:* None (unused until wired in).
5. **(Contingent) "Add R2 client alongside Supabase client, feature-flagged"** — new file(s) under `src/lib/`, not yet called from any route. *Difficulty:* Medium. *Risk:* None (dead code until flagged on).
6. **(Contingent) "Dual-write new uploads to R2 + Supabase"** — modify `api/cms/media/route.ts` POST only. *Difficulty:* Medium. *Risk:* Low — additive, doesn't change read path.
7. **(Contingent) "Switch read path (`media-url.ts`) to R2 behind env flag"** — the actual cutover for new/dual-written objects. *Difficulty:* Medium. *Risk:* Medium — this is the first commit that changes what users see; needs the visual-diff testing pass from Section 10.
8. **(Contingent) "Backfill: copy existing Supabase objects to R2"** — one-time script, same shape as `migrate-media.ts`. *Difficulty:* Low. *Risk:* Low (non-destructive copy, Supabase originals untouched).
9. **(Contingent) "Repoint hardcoded absolute Supabase URLs"** — the static hero images in `study-abroad/*`, `services/*`, `courses/*`, `Hero.tsx`, `UniversityLogos.tsx`. *Difficulty:* Low (mechanical) but *high file count*. *Risk:* Low individually, but this is the one step that can't be feature-flagged — do it last, after Step 7 is confirmed stable.
10. **(Contingent) "Remove Supabase Storage dependency"** — only after a full billing cycle of R2-only operation confirms stability. *Difficulty:* Low. *Risk:* Low at this point — everything upstream already de-risked it.

---

## 12. Questions and Unknowns

These need answers from outside the codebase (dashboard access, deployment config) before Section 9's plan can be executed with confidence — none are assumed or guessed above:

1. **What hosting platform serves this app, and does its Route Handler / edge caching actually cache `/api/images` responses?** (F1 — the central open question of this audit.)
2. **What does `npm run check-usage` currently report** for Egress vs. Cached Egress vs. DB size, split out? (Requires `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF` in `.env.local`, per the script's own doc comment — not present in this repo, so this audit could not run it.)
3. **Is the `career-uploads` bucket public or private in the Supabase dashboard?** (F2 — code alone can't answer this.)
4. **Does the live `site_settings` table (and any other table) have columns not reflected in `supabase/schema.sql`/`migrations/`?** (Confirmed drift on at least `ceo_*` columns — full extent unknown without a live schema pull.)
5. **Is there a CDN (Cloudflare, etc.) already sitting in front of the production domain at the DNS level**, independent of anything in this repo? This would materially change both the F1 answer and the migration cost-benefit.
6. **What is the actual current traffic split** between the public marketing site, the loyalty portal, and CMS admin usage? This determines how much the 7 remaining unproxied CMS `<img>` tags (Section 6.1) actually matter in practice.
7. **Current, exact pricing** for Cloudinary/ImageKit/BunnyCDN/R2 at this project's actual traffic tier — the figures in Section 8 are from public pricing pages and are explicitly marked as needing verification before any budget decision.
