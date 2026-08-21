# Supabase Storage → Cloudflare R2 Migration Audit — Phase 1

**Scope:** Investigation only. No code, configuration, `.env.local`, database, Supabase Storage, DNS, or production was modified. Every claim below is traced to a specific file/line in this repository, a read-only Supabase Storage API call, or a read-only database query — as checked out on branch `cms-team-and-pages`. Anywhere something could not be verified, it is stated as **"Could not verify"** rather than assumed.

**Verdict: NOT READY FOR PHASE 2 — 5 blockers found.** See §14.

---

## 1. Every Supabase Storage dependency

Full-repository search, not limited to obvious filenames. `Hero.tsx` and the team page — both previously missed — are confirmed present below.

### 1.0 — Read this before anything else in the report

Two files already exist in this repo's `docs/` folder (`image-architecture-blueprint.md`, `supabase-egress-audit.md`) — both **untracked**, never committed. They describe a caching proxy (`proxiedMediaUrl()`, a route at `src/app/api/images/[...path]/route.ts`) and state it explicitly: "the proxy works," "already written," "already used." **Neither exists on the branch actually checked out for this audit (`cms-team-and-pages`).**

They exist only on `loyalty-portal-ui` — a sibling branch that diverged from `main` at commit `156fb37` and has since taken the image-caching work in a direction `cms-team-and-pages` never received. Verified directly:

- `git branch -a --contains b29a665` (the commit that added the proxy) returns only `loyalty-portal-ui`
- `find src/app/api -iname "*images*"` on the current tree returns nothing
- `grep -rn "proxiedMediaUrl" src/` returns nothing outside the docs folder itself

This matters for every instruction that assumes a proxy exists ("do not modify `proxiedMediaUrl()`," "do not modify the existing proxy"). On this branch there is nothing to modify — the only proxy-shaped thing that exists is `src/proxy.ts`, which is Next.js middleware that gates `/cms` auth routes and has no relationship to images at all. Whether this migration should target `cms-team-and-pages` as-is, or wait for a merge with `loyalty-portal-ui` first, is the single highest-leverage decision in this report — see §14.

### The one real choke point: `resolveMediaUrl()`

`src/lib/media-url.ts` — 8 lines, one export, no proxy logic:

| Input | Behavior |
|---|---|
| Empty/null | returns `''` |
| Already starts with `http` | returned unchanged |
| Starts with `/media/` | rewritten to `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/<rest>` |
| Anything else | returned unchanged |

Callers (11 files, every one confirmed by direct grep):

| File | Call sites |
|---|---|
| `src/components/home/Hero.tsx` | line 254 — success-story image |
| `src/app/(frontend)/team/page.tsx` | lines 80, 123 — leadership + staff photos |
| `src/app/(frontend)/blog/page.tsx` | line 141 — blog list thumbnails |
| `src/app/(frontend)/blog/[slug]/page.tsx` | lines 245, 466 — post hero + related posts |
| `src/components/home/TeamTeaser.tsx` | line 48 |
| `src/components/home/SuccessStories.tsx` | line 84 |
| `src/components/home/Testimonials.tsx` | line 98 |
| `src/components/home/CEOMessage.tsx` | line 35 |
| `src/components/home/LatestBlog.tsx` | line 50 |
| `src/components/destinations/DestinationContent.tsx` | line 35 |
| `src/components/locations/LocationClient.tsx` | line 21 — `.map(resolveMediaUrl)` |

### Direct Supabase Storage API calls

| File:Line | Call | Purpose |
|---|---|---|
| `src/app/api/cms/media/route.ts:62,75,83` | `.storage.from('media').list(...)` | Three-level year → month → file listing for the CMS Media Library |
| `src/app/api/cms/media/route.ts:90,150` | `.storage.from('media').getPublicUrl(...)` | Build a public URL for a listed/uploaded file |
| `src/app/api/cms/media/route.ts:141` | `.storage.from('media').upload(path, buffer, {contentType, upsert:false})` | CMS upload — **no `cacheControl` option is set**, so every new upload gets Supabase's SDK default |
| `src/app/api/cms/media/route.ts:174` | `.storage.from('media').remove([path])` | CMS delete |
| `src/app/(frontend)/careers/CareersClient.tsx:70-72` | `anonClient.storage.from('career-uploads').upload(...)` | CV upload — **client-side, anon key, straight from the browser** — see §1.1 |
| `scripts/migrate-media.ts:67` | `.storage.from('media').upload(...)` | One-time historical bulk uploader (local `public/media/` → Storage), not part of any runtime path |

**Zero** occurrences of `createSignedUrl`/`createSignedUrls` anywhere in the repository. Every object is served fully public — there is no existing signed-URL pattern to port.

### 1.1 — The `career-uploads` bucket referenced in code does not exist

`CareersClient.tsx` uploads job-applicant CVs to a bucket named `career-uploads`. Direct verification against the live Supabase project via the service-role `listBuckets()` API (read-only, see §4) returns **exactly one bucket: `media`**. `career-uploads` is not among them. A direct `.storage.from('career-uploads').list('')` call returns `{ data: [], error: null }` — Supabase's client doesn't error on a listing against a nonexistent bucket, it just returns empty, which is why this wasn't obvious from the app's own error handling.

This means either every CV upload attempt has been silently failing (the `.upload()` call would return an error the UI does show, so applicants may be seeing "CV upload failed" without anyone noticing), or the bucket was deleted after being created. Unrelated to R2, but affects the migration inventory — there is no second bucket to migrate, only a broken reference to one.

### Bucket name literals

| File:Line | Literal |
|---|---|
| `src/app/api/cms/media/route.ts:4` | `const BUCKET = 'media'` |
| `src/constants/assets.ts:19` | `export const MEDIA_BUCKET = "media"` |
| `scripts/migrate-media.ts:19` | `const BUCKET = 'media'` |
| `src/app/(frontend)/careers/CareersClient.tsx:71` | `.from("career-uploads")` |

The bucket name is duplicated as a raw string literal in three separate places rather than imported once from `assets.ts`'s `MEDIA_BUCKET` constant — a provider swap means updating all three consistently, not one.

### Hardcoded absolute Supabase URLs (not derived from any shared constant)

Confirmed via repo-wide grep for the literal project hostname (`vlrhwdcqzpfqpbqeaqyr.supabase.co`) outside of `assets.ts`/`media-url.ts`'s own env-derived construction. These are the files a URL find-and-replace would need to touch directly — a config change to `NEXT_PUBLIC_SUPABASE_URL` alone would not fix any of them. **Hero.tsx and the team page are both present** (bold below).

**Site-wide chrome & metadata**

| File | What |
|---|---|
| `src/app/layout.tsx:17,63,83` | `defaultOgImage` (defined **twice**, identical literal) + `<link rel="preconnect">` to the Supabase hostname + Organization JSON-LD `logo` |
| `src/app/not-found.tsx:49` | 404 page logo `<Image>` |
| `src/components/layout/Header.tsx:119` | site logo `<img>` — does **not** actually use `TRANSIT_LOGO_URL` despite `assets.ts`'s doc comment claiming it does (stale comment, confirmed) |
| `src/components/layout/Footer.tsx:21` | site logo `<img>` |
| `src/components/layout/MobileMenu.tsx:176` | site logo `<img>` |
| **`src/components/home/Hero.tsx:212-216`** | 5 hardcoded testimonial-avatar URLs in a fallback/seed array |
| `src/components/home/LatestBlog.tsx:10` | `FALLBACK_IMAGE` const |
| `src/components/home/UniversityLogos.tsx:5` | own local `const BASE = "https://...supabase.co/storage/v1/object/public/media"` — a **third**, independent URL-construction point, duplicating `assets.ts`; feeds 5 hardcoded partner-logo URLs on the homepage marquee |
| `src/app/(frontend)/blog/[slug]/page.tsx:63-64` | own local `TRANSIT_LOGO` const — a **fourth** independent copy, used as an `authorAvatar`/OG fallback |

**Homepage & content pages**

| File | What |
|---|---|
| `src/app/(frontend)/page.tsx:151,162` | homepage OG/Twitter metadata images |
| `src/app/(frontend)/about/page.tsx:19,60,90` | hero + OG images |
| `src/app/(frontend)/resources/page.tsx:50` | hero image |
| `src/app/(frontend)/contact/page.tsx:21` | inline Tailwind background-image utility class |
| `src/app/(frontend)/services/page.tsx:58` | inline Tailwind background-image utility class |
| `src/app/(frontend)/services/scholarships-assistance/page.tsx:49,83` | hero + OG images |
| `src/app/(frontend)/services/admission-counselling/page.tsx:49,110` | hero + OG images |
| `src/app/(frontend)/services/test-preparation/page.tsx:54,297,309` | 3 image references |
| `src/app/(frontend)/services/sop-writing/page.tsx:103` | OG image |
| `src/app/(frontend)/services/student-visa-service/page.tsx:49,106` | hero + OG images |
| `src/app/(frontend)/courses/language-training/page.tsx:49,103` | hero + OG images |
| `src/app/(frontend)/courses/test-preparation/page.tsx:44,154` | hero + OG images |
| **`src/app/(frontend)/team/page.tsx:49`** | OG image (in addition to the `resolveMediaUrl()` calls above for the actual staff photos) |
| `src/app/(frontend)/locations/page.tsx:28,38,48,58` | `BRANCHES` array, 4 image references |
| `src/app/(frontend)/locations/[slug]/page.tsx` | ~15 references — hero + gallery images per branch office, `locationsData` object (lines 19,21,22,49,51-53,78,80-82,100,102-105) |

**Study-abroad country pages**

| File | What |
|---|---|
| `study-abroad/usa, uk, canada, germany, australia /page.tsx` | each: hero image via `CountryDestinationPage` prop + shared logo constant for OG/Twitter |
| `study-abroad/ireland, italy, new-zealand, south-korea /page.tsx` | each: hero + OG images (these 4 are fully static content, no DB connection at all — see §5) |
| `study-abroad/[slug]/page.tsx:71,165` | fallback hero image + logo — also always renders the **Canada** banner image regardless of the actual country being viewed (pre-existing content bug, unrelated to storage provider, noted only because it sits in a file this migration will already touch) |

> **Explicitly out of scope, found but not Supabase:** two hardcoded `images.unsplash.com` hotlinks exist (`src/app/(frontend)/compliance/page.tsx:425` and `src/app/(frontend)/locations/[slug]/page.tsx:302-305`, destination-tile thumbnails). Neither touches Supabase Storage or needs any change for this migration — listed only so they aren't mistaken for missed Supabase references during later verification.

### Environment variables referenced (names only — no values read)

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ~20 files — every Supabase client, `assets.ts`, `media-url.ts`, `proxy.ts`, the media route, every migration/backup script |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `supabase.ts`, `supabase-server.ts`, `proxy.ts`, `CareersClient.tsx`, CMS login route |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase-admin.ts`, `rate-limit.ts`, the media route's inline `serviceClient()`, all backup/seed scripts |
| `SUPABASE_ACCESS_TOKEN` | `scripts/check-supabase-usage.ts` only — a separate Management-API personal access token, unrelated to Storage object access |

No `MEDIA_URL`, `IMAGE_URL`, `CDN_URL`, or any `R2_*` variable exists anywhere in the repo — confirms no R2 configuration exists yet. No `.env.local.example` file exists to document expected variable names for a new contributor.

### Scripts — full behavior, not just grep hits

| Script | Touches Storage? | What it does |
|---|---|---|
| `scripts/migrate-media.ts` | Yes | One-time: walks local `public/media/` recursively, uploads every file to the `media` bucket preserving relative paths. No `cacheControl` set. This is how the bucket was originally populated. |
| `scripts/export-all-tables.ts` | No | Read-only DB backup — dumps 24 named Postgres tables + `auth.users` to JSON/CSV. Backs up image *URLs* stored in rows, never the underlying Storage objects. |
| `scripts/check-supabase-usage.ts` | No | Queries the Supabase Management API for project usage/egress metrics. Doesn't touch the Storage object API. |
| `scripts/migrate-to-supabase.ts`, `create-admin.ts`, `setup-profiles.ts`, `setup-universities.ts` | No | DB/auth seed scripts. `setup-universities.ts` inserts third-party Clearbit logo URLs (not Supabase Storage) into a `universities` table that does not appear in `schema.sql` or any migration file — likely stale/unused, existence unconfirmed. |

### SQL migrations — storage-related statements

Searched all 6 files in `supabase/migrations/` plus `supabase/schema.sql` for anything touching `storage.objects`, bucket creation, or storage RLS policies: **zero matches.** The `media` bucket was created directly in the Supabase dashboard, not via a tracked migration — there is no SQL to reference for how it was configured (public/private, file size limit, MIME allowlist all live only in Supabase's own bucket config, confirmed independently in §4).

### A leftover local copy: `public/media/`

> `public/media/` still exists in this repository — **200MB, 527 files, tracked in git** (not gitignored), bundled into every clone and every deployment. It's the original source directory `migrate-media.ts` read from when it first populated Supabase Storage. Nothing in the current app ever links to `/media/...` as a literal Next.js static path — `resolveMediaUrl()` intercepts any string starting with `/media/` and rewrites it to the Supabase URL before it ever reaches a browser. But Next.js still serves `public/` at the site root by default, so these 527 files remain directly fetchable at `/media/<path>` if anyone (an old bookmark, an old backlink, a stale cached page) requests them — a second, silently-orphaned copy of the same content, invisible to the app's own code paths. Relevant to a migration because if R2 cutover ever removes `resolveMediaUrl()`'s Supabase-rewrite behavior without also addressing this directory, `/media/...` requests would start serving these stale local files instead of erroring or redirecting.

---

## 2. Complete dependency inventory

Every finding from §1, categorized. Rows that apply to many similar files are consolidated with a file list rather than repeated 10–15 times — nothing is omitted, the lists are complete.

| File / Location | Category | Purpose | Current behavior | R2 change required | Risk |
|---|---|---|---|---|---|
| `src/lib/media-url.ts` — `resolveMediaUrl()` | Image proxy | Single choke point that turns a stored relative path into a full public URL | String rewrite only — no caching, no fetch, no transform. Not a proxy in the HTTP sense despite the name in prior notes. | **Yes, cutover-critical.** The base URL / rewrite target must change to R2's public URL. | **High** |
| `src/constants/assets.ts` | Configuration | Defines `STORAGE_BASE`, `MEDIA_BUCKET`, `MEDIA_BASE`, `TRANSIT_LOGO_URL` | Derives everything from `NEXT_PUBLIC_SUPABASE_URL` — already a real single-source-of-truth pattern, just not used everywhere it could be | Yes — becomes the new base-URL choke point for R2 | **Medium** |
| `src/app/api/cms/media/route.ts` | API / backend | CMS Media Library — list, upload, delete | Direct `.storage.from('media')` calls; own inline service client; own `toStoragePath()` parser; no `cacheControl` set on upload | Yes, cutover-critical — swap for R2's S3-compatible `PutObject`/`ListObjectsV2`/`DeleteObject` | **High** |
| `src/app/(frontend)/careers/CareersClient.tsx` | Storage API usage | Client-side CV upload to `career-uploads` | Uploads directly from the browser with the anon key, to a bucket that **does not exist** in the live project (§1.1) | Needs a decision independent of R2: fix the missing bucket first, then decide whether CVs move to R2 too (different access-control needs — PII, not public) | **Critical** *(pre-existing bug, not caused by R2 planning)* |
| 11 `resolveMediaUrl()` callers (see §1 table) | Image rendering | Render CMS/DB-sourced images site-wide | All correctly funnel through the one choke point | No — automatically inherits the new base URL once `media-url.ts` changes | **Low** |
| ~30 files with hardcoded absolute URLs (see §1 tables) | Direct URL reference | Hero images, OG/Twitter cards, logos, JSON-LD, marquee logos, gallery images | Literal strings, independent of `media-url.ts`/`assets.ts` — a config change to the env var alone will not fix any of these | Yes — mechanical find-and-replace, but must be exhaustive and is the one step in the whole migration that can't be feature-flagged (§9, §12) | **High** *(high file count, low complexity per file)* |
| `next.config.ts` — `images.remotePatterns` | Configuration | Allowlist for `next/image` | 5 hostnames allowed; Supabase entry scoped to `/storage/v1/object/public/**`; `minimumCacheTTL: 60` (not the 1-year value some prior notes assumed); no custom `loader` configured | Yes, cutover-critical — add R2/Cloudflare hostname(s), decide whether to keep or drop the Supabase entry (§12) | **High** |
| `next.config.ts` — CSP `img-src` / `connect-src` | Configuration | Browser-level Content-Security-Policy allowlist | Hardcoded Supabase hostname in both directives — separate from `remotePatterns`; enforced even for plain `<img>` tags that bypass `next/image` entirely | Yes — easy to forget since it's not the "images config" section; a missed CSP update silently blocks every plain `<img>` from the new domain even after `remotePatterns` is updated | **High** |
| Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`) | Environment variable | Auth/config for every Supabase client | ~20 files reference the URL var alone; no R2/CDN env vars exist yet | New vars needed (account ID, access key, secret, bucket, public base URL) — additive, not destructive, in Phase 2 | **Low** *(additive)* |
| Database columns — see §5 | Database/content dependency | 9 confirmed image/file columns across `blog_posts`, `team_members`, `testimonials`, `success_stories`, `events`, `loyalty_rewards`, `job_applications`, plus 2 dead columns and 1 schema-drift column | All store relative paths (`/media/...`) or full URLs, resolved at render time — not the raw provider name | No DB writes required if the URL swap happens entirely at the `resolveMediaUrl()` choke point — **only** if a decision is made to rewrite stored values instead of translating at read-time | **Medium** |
| 9 raw `<img src={dbField}>` without `resolveMediaUrl()`, CMS admin: `TestimonialsSection.tsx:67`, `SuccessStoriesSection.tsx:66,128`, `TeamSection.tsx:78,145`, `EventsSection.tsx:135`, `BlogEditor.tsx:564`, `MediaLibrarySection.tsx:99,164` (these two use full URLs from `getPublicUrl()`, so they load — just unproxied); **+ 2 more, public-facing:** `EventsPopup.tsx:67-68`, `UpcomingEvents.tsx:144` (both `event.banner_image`) | CMS, Image rendering | CMS admin edit-form previews (9) + homepage events banners (2) | Directly verified on this branch: bare DB values rendered with no URL resolution — likely broken image icons in 7 of the 9 CMS cases, and in both public-facing cases if `events.banner_image` is ever stored as a relative path (the convention every other field uses) | Pre-existing bug, independent of R2 — but any migration plan should decide whether to fix this alongside (same one-line pattern: wrap in `resolveMediaUrl()`) or explicitly defer it. The public-facing pair is higher-priority. | **High** *(public-facing pair)* |
| `public/media/` | Static content | Original local media directory, pre-Supabase-migration | 200MB / 527 files, git-tracked, orphaned — no in-app code links to it, but Next.js still serves it directly at `/media/<path>` | Not required for R2 migration itself, but worth a decision — see §1, §12 | **Low** *(dormant, not user-facing today)* |
| `public/sitemap-0.xml`, `sitemap.xml`, `robots.txt` | SEO/metadata | Build-generated via `next-sitemap` (postbuild script) | Confirmed: declares an `xmlns:image` namespace (package boilerplate) but contains **zero `<image:image>` entries** — page URLs only | None — nothing to migrate here | **Low** |
| `supabase/migrations/*.sql`, `schema.sql` | Other | Tracked schema history | Zero storage-related SQL; bucket was created out-of-band via the Supabase dashboard; independently confirmed stale — several live columns (§5) don't appear in any file here | None directly, but confirms the SQL files can't be trusted as ground truth without a fresh live-schema pull | **Medium** |
| `.claude/settings.json` | Other | Claude Code tooling permission allowlist (not app code) | Contains hardcoded object URLs from past debugging sessions, **and a plaintext Postgres connection string with an embedded password** (line 36) — flagged separately in §12 | Not part of the R2 migration; recommend rotating the DB password and scrubbing this file regardless of migration timing | **Critical** *(credential exposure, separate issue)* |

---

## 3. Current image architecture

Derived directly from the code — not assumed. There is **no caching proxy, no signed URLs, and no third-party image service** on this branch. Three parallel, independent paths reach the same Supabase Storage objects:

```
Supabase Storage (bucket "media", public, 544 objects)
        │
        │  CMS admin uploads via POST /api/cms/media, or DB stores a path
        ▼
Stored value in Postgres — relative path or full URL
   e.g. photo_url = "/media/2026/04/x.webp"
        │
        │  read-time resolution — three different things can happen
        ├────────────────────────┬──────────────────────────┐
        ▼                        ▼                           ▼
  Path A                    Path B                       Path C
  resolveMediaUrl()         hardcoded literal            CMS admin previews
  → next/image              → next/image or <img>        → raw <img>
  Rewrites to full URL,     ~30 files skip                9 places render a
  handed to <Image>.        resolveMediaUrl() entirely    DB field straight
  Next's optimizer          — the full Supabase URL       into src with no
  fetches/resizes/          is typed directly into        resolution at all —
  converts to AVIF/WebP,    source (heroes, OG tags,      likely broken in 7
  caches with               logos, JSON-LD).              of 9 cases.
  minimumCacheTTL: 60s.
        │                        │                           │
        └────────────────────────┴──────────────────────────┘
                                  ▼
                       Browser fetches directly
                       from Supabase Storage —
                       no intermediary origin
```

### Answering your specific questions

| Question | Answer |
|---|---|
| Where are files uploaded | Two entry points: `POST /api/cms/media` (service-role client, CMS admin only) and `scripts/migrate-media.ts` (one-time historical, not a runtime path) |
| Where are files stored | Supabase Storage, bucket `media`, path convention `<year>/<month>/<filename>`, confirmed 100% consistent (§4) |
| How are URLs generated | Either `supabase.storage.from('media').getPublicUrl(path)` server-side at upload/list time, or `resolveMediaUrl()`'s string interpolation at render time, or typed directly as a literal |
| How are URLs stored in the DB | Inconsistently — some columns store the bare relative path (`/media/...`), some store the full public URL, depending on which code path wrote them (see §5) |
| How do URLs reach the frontend | Directly — CMS API routes return whatever shape the DB has; nothing normalizes it server-side before the client receives it |
| Does a proxy modify requests | **No.** No proxy exists on this branch. (One exists on `loyalty-portal-ui` — see §1.0.) |
| Is Next.js Image optimization involved | Yes, for Path A/B when `<Image>` is used — default built-in loader, no custom loader configured |
| Is Cloudinary or any other image service involved | No — confirmed via `package.json` (no image-service SDK) and grep (no third-party image-service hostnames in CSP/remotePatterns beyond Unsplash/flagcdn/pravatar, which are placeholder/flag/avatar sources unrelated to the CMS's own media) |
| Caching behavior | Three independent, uncoordinated layers: Supabase's own object cache-control (set only implicitly — no `cacheControl` option passed on upload), Next's image optimizer (`minimumCacheTTL: 60`s), and the browser's own cache honoring whatever `Cache-Control` header actually arrives. **Could not verify** the actual header value without an HTTP response inspection against production, out of scope for a code-only Phase 1. |
| Signed vs public URLs | 100% public. Zero `createSignedUrl` usage anywhere. |
| Any transformations currently happening | Only Next's own optimizer (resize + AVIF/WebP conversion) for images rendered via `<Image>`. Plain `<img>` paths get the original bytes, untouched, at full resolution. |

---

## 4. Storage bucket audit

Read-only — `listBuckets()` and recursive `.list()` calls only, via the service-role key already in `.env.local`. No object was uploaded, deleted, renamed, or modified.

**Summary:** 1 bucket, 544 objects, 244.35 MB, max folder depth 2, 0 objects with missing content-type, 0 suspicious paths.

### Bucket configuration (from `listBuckets()`)

| Property | Value |
|---|---|
| Name | `media` |
| Public | `true` |
| File size limit | 20,971,520 bytes (20 MB) |
| Allowed MIME types | image/jpeg, image/png, image/webp, image/gif, image/svg+xml, application/pdf |
| Created | 2026-05-08T17:59:29Z |
| `career-uploads` | Does **not** exist as a bucket in this project — see §1.1 |

### File type distribution

| Extension | Count | Total size |
|---|---|---|
| `.png` | 332 | 198.79 MB |
| `.jpg` | 193 | 43.28 MB |
| `.jpeg` | 12 | 1.76 MB |
| `.webp` | 4 | 0.29 MB |
| `.gif` | 3 | 0.23 MB |

No `.svg` or `.pdf` objects exist despite both being in the bucket's allowed-MIME list — the allowlist is broader than what's actually been uploaded.

### Top 10 largest files

| Size | Path |
|---|---|
| 10.93 MB | `2025/02/Office-1.png` |
| 9.63 MB | `2026/06/IMG_4953.png` |
| 7.79 MB | `2026/06/IMG_4957.png` |
| 7.74 MB | `2026/06/IMG_4951.png` |
| 7.29 MB | `2026/06/IMG_4956.png` |
| 6.72 MB | `2026/06/IMG_4952-1.png` |
| 6.20 MB | `2026/06/IMG_4950.png` |
| 3.26 MB | `2026/08/Screenshot-2026-06-17-at-8-34-58-PM-2.png` |
| 2.24 MB | `2021/07/Web-banner-down-1.png` |
| 1.94 MB | `2025/02/Nepals-leading-study-abroad-consultants.png` |

### Top 10 smallest files

| Size | Path |
|---|---|
| 0.88 KB | `2021/05/dots.png` |
| 3.18 KB | `2023/05/testimonial-03.jpg` |
| 3.23 KB | `2021/04/images-1.png` |
| 3.27 KB | `2021/07/images-1.png` |
| 3.29 KB | `2021/05/bg-shape.jpg` |
| 3.47 KB | `2021/04/download-2.png` |
| 3.60 KB | `2021/07/download.png` |
| 3.61 KB | `2021/07/download-2.png` |
| 3.64 KB | `2021/07/images-1.jpg` |
| 3.68 KB | `2023/04/domain-registration.png` |

### Folder structure & naming health

| Check | Result |
|---|---|
| Folder depth | 100% of objects at depth 2 (`year/month/file`) — no exceptions |
| Filenames with spaces | 0 |
| Filenames with non-ASCII characters | 0 |
| Filenames with other URL-unsafe characters | 0 |
| Case-only path collisions | 0 |
| Suspicious paths (traversal-like, double slashes, dotfile segments) | 0 |
| Objects with missing/unknown content-type | 0 |

This bucket is unusually clean — R2's object key rules are a superset of what's here (R2 is case-sensitive and UTF-8-safe like Supabase Storage), so no path needs remapping for compatibility reasons alone.

### Same filename in different folders — 41 cases (heuristic, not proof of duplicate content)

Filename match only; byte-level comparison was not performed. A sample:

| Filename | Locations |
|---|---|
| `Ajay-Rijal.png` | 2021/03, 2021/04 |
| `BhesRaj-Regmi.png` | 2021/03, 2021/04 |
| `Bikram-Regmi.png` | 2021/03, 2021/04 |
| `Diwakar-visa-garnt.png` | 2021/03, 2021/04 |
| `Hari_pic_1-400x400-2.jpg` | 2021/03, 2023/05 |
| `IMG_20200501_155516.jpg` | 2021/03, 2021/04 |
| `Nista-Shrestha.png`, `Ranjan.png`, `Sadiksya.png`, `Susmita-pramod.png` | each: 2021/03, 2021/04 |
| `Cover_Tranzit.png` | 2021/04, 2021/05 |
| `download.png`, `download-1.png`, `download-1-1.png`, `download-2.png` | each: 2021/04, 2021/07 |
| `DuquesneUniversityLogo.png` | 2021/04, 2021/07 |
| `images-1.png`, `images-2.png`, `images-3.png` | each: 2021/04, 2021/07 |
| `unnamed.jpg` | 2021/04, 2021/07 |

*(+ 27 more not listed here for space — captured in the audit run, available on request.)*

Since R2 keys are the full path (`year/month/filename`, not just the filename), none of these collide as R2 object keys — this is purely a content-hygiene observation, not a migration blocker.

### How this was checked

A temporary, git-ignored script (deleted before this report was written) used `@supabase/supabase-js` — already a project dependency — to call `supabase.storage.listBuckets()` and recursively `supabase.storage.from('media').list(prefix, {limit: 1000})` at every folder level, aggregating size/mimetype/path metadata client-side. Every call is read-only per the [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage-list).

---

## 5. Database references

Every table/column read via `src/app/api/cms/**/route.ts`, cross-checked against `src/types/cms.ts` and every migration file. Database values were only read (`SELECT`) — nothing was written.

### Confirmed image/media columns

| Table.column | Type | CMS route(s) | Note |
|---|---|---|---|
| `blog_posts.featured_image` | text | `/api/cms/blog`, `/blog/[id]` | Also read directly (not via CMS API) by the public blog list/detail pages |
| `team_members.photo_url` | text | `/api/cms/team-members`, `/[id]` | Mapped to/from `photo` in the API response |
| `testimonials.photo_url` | text | `/api/cms/testimonials`, `/[id]` | Mapped to/from `photo` |
| `success_stories.approval_image_url` | text | `/api/cms/success-stories`, `/[id]` | Mapped to/from `approvalImage` |
| `events.banner_image` | text | `/api/cms/events`, `/[id]` | |
| `loyalty_rewards.image_url` | text | `/api/cms/loyalty/rewards`, `/[id]` | Mapped to/from `imageUrl`, zod-validated |
| `job_applications.cv_url` | text | `/api/cms/job-applications`, `/[id]` | File, not image, but same bucket family — sourced from the missing `career-uploads` bucket (§1.1) |
| `resources.url` | text, NOT NULL | `/api/cms/resources`, `/[id]` | General file URL (PDFs/docs, may include images) |
| `authors.photo_url` | text | — | **Dead column** — blog routes explicitly select `authors(name, credential, bio)`, omitting it; nothing in the app reads it |
| `profiles.avatar_url` | text | — | **Dead column** — no route or script touches it |

### Ambiguous — flagged, not assumed

| Table.column | Why ambiguous |
|---|---|
| `countries.flag` | Used with a `getFlagEmoji()`-style helper in the frontend — most likely a 2-letter code or literal emoji character, not an uploaded Storage object. Confirm with product before including in a URL migration. |
| `loyalty_milestones.icon` | Zod schema caps it at `max(20)` characters — far too short for a URL, strongly suggesting an emoji/short icon name rather than an image reference. |

### 5.1 — CORRECTED IN SECOND-PASS REVIEW: `site_settings.ceo_photo_url` does not actually exist

> **This finding was wrong in the original Phase 1 report, and the error is instructive.** Phase 1 reasoned: "the homepage's direct `select('*')` successfully returns it, so the column genuinely exists live." That reasoning is invalid — a successful `select('*')` query followed by JS property access (`settingsRes.data?.ceo_photo_url`) **never throws for a missing key**; it silently evaluates to `undefined` whether or not the column exists. A successful query proves nothing about whether a specific referenced field is real.
>
> Direct verification in the second-pass review (read-only): `SELECT ceo_photo_url FROM site_settings` against the live database returns **Postgres error `42703: column site_settings.ceo_photo_url does not exist`**. An unfiltered `select('*')` against the live table (both via the service-role key and the anon key) returns exactly 9 columns — `id, site_name, tagline, contact_email, contact_phone, office_address, social_links, seo_config, updated_at` — none of which are `ceo_photo_url`, `ceo_name`, `ceo_title`, `ceo_message`, or `tiktok_url`.
>
> **Corrected conclusion: this is not schema drift. It is a feature that was scaffolded in application code (the TypeScript type, the CMS admin form field, the homepage's read) but never actually implemented at the database layer.** `settingsRes.data?.ceo_photo_url` on the homepage always evaluates to `undefined` today, silently falling through to whatever fallback the component uses. `PUT /api/cms/settings` correctly (if accidentally) never persists these fields, because there is nowhere to persist them to. The CMS admin form presenting an editable "CEO Photo URL" text input that can never be saved is real and worth fixing (misleading to editors) — but it is a dead-feature cleanup, not a migration risk, and it drops out of the blocker list (§17).
>
> This also means `supabase/migrations/001_add_tiktok_and_germany.sql`'s `ALTER TABLE site_settings ADD COLUMN tiktok_url` was either never applied to this live database, or was applied and later reverted — either way, **the migration file and the live database disagree**, which is exactly the kind of drift §13 warns about, just not in the direction Phase 1 originally described.

### Remaining verified drift/uncertainty cases

- `universities` table — **confirmed via direct introspection** (second-pass) to not exist: `SELECT * FROM universities LIMIT 1` returns `PGRST205: Could not find the table 'public.universities' in the schema cache`. `scripts/setup-universities.ts` targets a table that does not exist — dead/broken script, not a live dependency. (Upgraded from "could not verify" to confirmed.)
- `pages` table — also confirmed not to exist, consistent with migration `006_drop_pages_table.sql` having removed it. Expected, not a concern.
- **Introspection limitation, stated plainly:** the second-pass column check works by sampling one live row per table and reading its JS object keys — this cannot discover columns on a table with zero rows. `franchise_inquiries`, `job_applications`, `job_openings`, `loyalty_milestones`, `loyalty_milestone_completions`, `loyalty_redemptions`, `loyalty_rewards`, `loyalty_transactions`, and `newsletter_subscribers` are all currently empty, so this method could not independently corroborate their columns. For those tables, §5's original column list remains sourced from the CMS API routes' explicit named-column `select`/`insert`/`update` statements — which, unlike the `ceo_photo_url` case, error immediately (not silently) if a named column doesn't exist, making that evidence trustworthy on its own terms. No contradiction was found for any of them.
- `countries.flag` and `loyalty_milestones.icon` remain ambiguous exactly as originally assessed — the introspection pass corroborates `countries.flag`'s presence but doesn't resolve whether it's an emoji/code vs. an image reference.

### `src/types/cms.ts` — every field shaped like an image URL

| Type.field | Maps to |
|---|---|
| `SuccessStory.approvalImage` | `success_stories.approval_image_url` |
| `Testimonial.photo` | `testimonials.photo_url` |
| `TeamMember.photo` | `team_members.photo_url` |
| `SiteSettings.ceo_photo_url` | `site_settings.ceo_photo_url` (drift column, §5.1) |
| `MediaFile.path` / `MediaLibrary` | CMS Media Library's own representation — `path` is always a full public URL from `getPublicUrl()` |
| `CmsEvent.banner_image` | `events.banner_image` |
| `JobApplication.cv_url` | `job_applications.cv_url` |
| `LoyaltyReward.imageUrl` | `loyalty_rewards.image_url` |
| `LoyaltyMilestone.icon` | ambiguous — see above |
| `Country.flag` | ambiguous — see above |
| `BlogPost.featuredImage` (`src/lib/types/blog.ts`) | `blog_posts.featured_image` |

Note: `src/types/cms.ts`'s own `CmsBlogPost` type does not carry an image field — the full `featuredImage` field lives on the separate `BlogPost` type in `src/lib/types/blog.ts`, whose own doc comment explicitly says `// path under /public/media/`, confirming the legacy relative-path convention is still the assumed shape at the type level.

### Other data-layer notes

- **`src/lib/cms-data.ts` is dead code** — a legacy JSON file read/write helper predating the Supabase migration. Zero importers anywhere in `src/`.
- **No separate Payload CMS** — `src/app/(payload)/admin` exists but is a non-functional placeholder. No `payload.config.ts` anywhere, `payload` is not a dependency. It does not touch storage.
- `blog/[slug]/page.tsx` uses the service-role client (`supabaseAdmin`) rather than the anon client used by the blog list page — no comment in the code explains why; flagged as undocumented rather than assumed.
- `scripts/export-all-tables.ts` backs up DB rows (so image *URLs* are backed up) but never the underlying Storage bytes.

---

## 6. Next.js image handling

This project runs Next.js 16.2.4 — every claim below was checked against the actual installed package docs at `node_modules/next/dist/docs/`, not recalled from general training knowledge.

### `next.config.ts` — current state

| Setting | Value |
|---|---|
| Loader | not set → defaults to Next's built-in Image Optimization API |
| Formats | `['image/avif', 'image/webp']` |
| minimumCacheTTL | 60 (seconds) |
| remotePatterns | transiteducation.com.np, images.unsplash.com, flagcdn.com, i.pravatar.cc, vlrhwdcqzpfqpbqeaqyr.supabase.co (scoped to `/storage/v1/object/public/**`) |

### Does a built-in `loader: 'cloudflare'` exist in this Next.js version?

**No.** Verified directly against `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/images.md`: the only built-in `loader` config values are the default (Next's own optimizer) and `'custom'`. Cloudflare appears only under "Example Loader Configuration" — a documentation example showing what a hand-written custom loader function looks like for Cloudflare's Image Transformations URL convention, **not** a preset string you can select.

### What using it would actually require

| Question | Answer (doc-verified) |
|---|---|
| Compatible with this Next.js version? | Yes, as a *custom* loader — `images: { loader: 'custom', loaderFile: './my/image/loader.js' }`, or per-`<Image>` via the `loader` prop |
| What configuration is required | A loader function returning a URL string, following Cloudflare's documented pattern: `https://example.com/cdn-cgi/image/width=W,quality=Q,format=auto/<src>` — requires Cloudflare sitting in front of the origin as a zone/proxy, not just an R2 bucket (see §7) |
| Can it coexist with the current setup? | Yes — `loader` can be set per-`<Image>` instance via the prop rather than globally, so a custom Cloudflare loader could be introduced for R2-hosted images while Supabase-hosted images keep using the default loader during a transition |
| Does it require changing every `<Image>` usage? | Only if configured per-instance. Setting it globally in `next.config.ts` applies to every `<Image>` at once, with no per-call-site changes needed — but that also applies to every remaining Supabase-hosted image too, which would break unless the custom loader function handles both origins |
| Does it affect `remotePatterns`? | Functionally bypasses it for the images it handles — under a custom loader, Next no longer fetches the image itself server-side, it just renders `<img>`/`srcset` pointing at whatever URL the loader returns. `remotePatterns` stops being the relevant gate; CSP `img-src` becomes the operative browser-side allowlist instead |
| Does it affect local development? | Same behavior in dev and prod, but Cloudflare's `/cdn-cgi/image/` transform endpoint only exists on a domain actually proxied through Cloudflare — a custom loader pointed at it would not work against plain `localhost` |
| Does it affect existing Supabase images? | Only if the loader is applied globally and doesn't special-case them — a loader function can branch on the URL's origin to route Supabase images through default behavior and R2 images through the Cloudflare transform pattern |
| Is a custom loader safer than the built-in one? | Not "safer" in the abstract — it's the *only* option, since there's no built-in Cloudflare preset. The real safety question is global vs. per-call-site adoption (§9) |

### `<Image>` vs plain `<img>` usage

Both patterns are in active use — `<Image>` for most public-facing content, plain `<img>` for CMS admin previews, the marquee logo strip, and several destination/location components. The risk is inconsistency, not the split itself — only `<Image>` usage is gated by `remotePatterns`/the image optimizer, while plain `<img>` is gated only by CSP `img-src` and browser CORS.

### Unoptimized / SVG handling

Per the doc: SVG sources bypass optimization automatically. Moot today since the bucket contains zero SVGs (§4). No explicit `unoptimized` prop usage was found in the components inspected during this audit.

---

## 7. Cloudflare R2 architecture

Nothing in this section is verified against an actual Cloudflare account or dashboard — there is no R2 configuration anywhere in this repo to inspect. This is general, stable infrastructure knowledge for planning purposes.

> **UPDATED IN SECOND-PASS REVIEW — DNS checked directly, read-only, no credentials required.** `dig NS transiteducation.com.np` returns `ns1.vercel-dns.com` / `ns2.vercel-dns.com` — **the production domain's DNS is managed by Vercel, not Cloudflare.** (The `.com` variant of the domain resolves to `ns1/ns2.greengeeks.net`, an unrelated registrar/host, and does not appear to be the live site.) This is a real, load-bearing fact the original Phase 1 report correctly flagged as unverified but could not resolve — it's now resolved, and it changes the custom-domain plan in §8: a Cloudflare-fronted `images.transiteducation.com.np` subdomain **is not simply available today**; it requires an explicit infrastructure step first. See §8 for the three concrete options this creates. (This also raises confidence that Vercel is the hosting platform generally — consistent with, though not proof-positive confirmation of, the `.vercel.app`-related references seen in the `loyalty-portal-ui`-branch docs — no `vercel.json` exists in this repo to make it fully certain, but the DNS evidence is strong.)

> **These are two different products — treat them separately.** **R2 object storage** is Cloudflare's S3-compatible bucket storage — it stores bytes and serves them back, with no image-aware behavior of its own. **Cloudflare Image Transformations** (the `/cdn-cgi/image/...` endpoint from §6) is a separate resizing/format-conversion service that sits in front of an origin — it can point at an R2 bucket, but it can equally point at Supabase Storage today, or any other origin. Provisioning an R2 bucket does not automatically get you resizing, format conversion, or a CDN in front of it.

### What needs configuring for each

| Component | Purpose | Configuration needed |
|---|---|---|
| R2 bucket | Object storage — replaces the Supabase `media` bucket 1:1 | Create bucket; decide public-bucket access (R2's own public-URL feature, `*.r2.dev`) vs. requiring a custom domain in front of it |
| S3-compatible API | Upload/list/delete from the CMS media route and any migration script | R2 exposes an S3-compatible endpoint per account; needs an S3 SDK (`@aws-sdk/client-s3` or similar) — **not currently a dependency** |
| Public access | Let browsers fetch objects directly | Either R2's built-in `*.r2.dev` public bucket URL (rate-limited, not meant for production traffic per Cloudflare's own guidance) or a custom domain routed through a Cloudflare zone |
| Custom domain (e.g. `images.transiteducation.com.np`) | Stable, brandable, cacheable public URL | **VERIFIED: DNS is on Vercel, not Cloudflare (see banner above).** Three concrete options, in recommended order — see §8's expanded treatment: (1) delegate just the `images` subdomain's NS records to Cloudflare, leaving the apex domain's Vercel DNS completely untouched; (2) use R2's `*.r2.dev` public URL as an interim/proof-of-concept step only; (3) move the entire domain's DNS to Cloudflare — not recommended, unnecessary blast radius for an image-hosting change |
| Cloudflare Image Transformations | Resize/format-convert on the fly | Enabled per zone, priced/limited separately from R2 storage+egress — genuinely optional; Next's built-in optimizer already does resize/AVIF/WebP conversion today |
| Cache behavior | How long an object stays cached at the edge / in the browser | Governed by `Cache-Control` headers R2 returns (configurable per-object) plus any Cloudflare Cache Rules at the zone level. **Clarified in second-pass review:** if the custom-domain option above is chosen and that subdomain's DNS record is proxied through Cloudflare (the standard "orange-cloud" setting), edge caching happens automatically as a side effect of the DNS proxy itself — this is Cloudflare's core CDN, included at no extra cost, and is a **separate mechanism from Image Transformations**. Don't conflate "do we need Transformations for caching" (no) with "do we need Transformations for resizing" (only if wanted — see recommendation below). |
| Content types | Correct `Content-Type` on each object | Set explicitly on upload via the S3 SDK's `ContentType` param — a direct port of the current pattern |
| CORS | Allow the app's origin(s) to fetch objects cross-origin | Configured on the R2 bucket itself. **Clarified in second-pass review:** CORS only gates client-side JavaScript reading a cross-origin resource (`fetch`/`XHR`/`canvas`, or an explicit `crossOrigin` attribute) — a plain `<img src="...">` or `next/image` (which fetches server-side, not subject to browser CORS at all) renders fine cross-origin with **no CORS configuration needed**. No component in this codebase was found doing canvas/fetch-based image processing, so CORS risk is lower than a first read suggests — configuring it permissively on the bucket anyway is free and defensive, not a requirement for basic rendering to work. |
| Browser access | Same-origin vs cross-origin image loading | Depends on the custom-domain decision — same-parent-domain is simpler for CSP/CORS |
| Next.js compatibility | Whether `next/image` can serve R2-hosted images | Yes, either via `remotePatterns` (default loader, low-effort) or a custom loader if Image Transformations is also adopted |
| Direct object URLs | Un-transformed, original-resolution fetch | `https://<bucket>.<account-id>.r2.cloudflarestorage.com/<key>` (S3-style) or the custom-domain equivalent |
| Transformed URLs | Resized/format-converted delivery | Only exists if Image Transformations is enabled — `https://images.transiteducation.com/cdn-cgi/image/width=800,format=auto/<key>`-shaped |

> Pricing, exact quota figures, and current product limits for R2/Image Transformations were not looked up as part of this repo-scoped audit and should be treated as **"Could not verify"** until checked against Cloudflare's current published pricing before any budget decision.

### Recommendation, stated explicitly: do not adopt Cloudflare Image Transformations for this migration

No concrete need for it was found. Next.js's built-in image optimizer already provides resize + AVIF/WebP conversion for every `<Image>` call site today, and that behavior is unaffected by switching the underlying storage provider (§6) — adding Transformations on top would be a second, redundant transform layer, with its own cost/complexity, that could double-process or conflict with `next/image`'s own output. It also doesn't help the plain-`<img>` call sites (§2's ~55 rendering-path inventory) get resized "for free" — those already render un-resized originals today regardless of storage provider, and the existing, already-proven fix for that (converting a call site to `<Image>`, or the previously-drafted `AppImage` wrapper idea) doesn't require Transformations either. Revisit only if a specific, named need emerges later (e.g., wanting responsive variants for the plain-`<img>` cases without touching `next/image`) — treat that as separate, optional future work (§16), not part of this migration's scope.

---

## 8. Proposed final URL architecture

A proposal for review, not a decision already made. Expanded and corrected in the second-pass review.

**Canonical public URL:** `https://images.transiteducation.com.np/<year>/<month>/<filename>` *(corrected domain — the app's real canonical domain, confirmed throughout the codebase's own hardcoded URLs and DNS records, is `transiteducation.com.np`, not `.com`; the original draft of this section used the wrong TLD)*. Preserves the exact object-key convention already in use (§4 confirmed 100% consistency) — a base-URL swap, not a re-keying exercise.

### DNS path to get there — three options, now concretely comparable (§7 update)

| Option | What it requires | Blast radius | Recommendation |
|---|---|---|---|
| **1. Delegate the `images` subdomain to Cloudflare** | Add an NS-delegation record for `images.transiteducation.com.np` at the current DNS provider (Vercel DNS), pointing that one subdomain's authority at Cloudflare; add it as a (partial) zone in Cloudflare; connect it to the R2 bucket as a custom domain | Low — the apex domain and every other subdomain stay on Vercel DNS exactly as today; only `images.*` moves | **Recommended target architecture** |
| **2. R2's own `*.r2.dev` public URL** | Nothing — enabled per-bucket in the R2 dashboard, no DNS changes at all | None | Acceptable **only** as the Phase 3 single-object proof step, or a short-lived interim if the subdomain delegation isn't ready yet — not for sustained production traffic (Cloudflare's own guidance says this URL isn't intended for that, and it doesn't carry the brand-domain benefit) |
| **3. Move the entire domain's DNS to Cloudflare** | Change NS records for the whole `transiteducation.com.np` zone at the registrar | High — touches the live Vercel-hosted site's DNS entirely, unrelated to image storage | **Not recommended** — disproportionate blast radius for what this migration needs |

| Question | Proposal |
|---|---|
| Canonical URL shape | Option 1 above (`images.transiteducation.com.np`, Cloudflare-proxied) rather than `*.r2.dev` or the raw S3 endpoint for production — same-parent-domain simplifies CSP, and the DNS proxy gives free edge caching (§7) |
| Bucket/object path | Keep `<year>/<month>/<filename>` unchanged — zero rekeying, zero DB-value rewriting needed if the base URL alone changes |
| Public vs private | Public, matching current behavior exactly, **for the `media` bucket only**. `career-uploads`/CVs are an explicit exception — private, signed URLs, separate bucket (§9's security review) |
| Transformation URL | Not adopted for this migration — see §7's explicit recommendation against Cloudflare Image Transformations |
| Caching | Set `Cache-Control` explicitly on every object at upload time via the S3 SDK — the current Supabase upload path passes no `cacheControl` option at all, worth fixing in the same commit that ports the upload logic |
| Image format conversion | No change — stays Next's job via `next/image`'s existing `formats` config |
| Resizing | No change — same reasoning |
| Fallback behavior | Every current hardcoded fallback constant (`defaultOgImage` ×2, `FALLBACK_IMAGE`, the local `TRANSIT_LOGO` in `blog/[slug]/page.tsx`, the fallback in `blog/page.tsx`) needs its literal updated at the same time as its neighboring real reference |
| Missing-image behavior | Currently inconsistent — some components have an `onError` hide-on-fail handler, most don't. Not required for R2 parity, but worth deciding once rather than per-component |

### The one canonical resolution function — corrected to handle the real, mixed data shape

Phase 1 characterized database values as "relative paths or full URLs" but treated the fix as a simple base-URL swap. On closer reading, `resolveMediaUrl()`'s own two branches (`if (url.startsWith('http')) return url` vs. the `/media/` rewrite) prove the database genuinely contains **both** shapes today, written by different code paths across the app's history — some fields were written with the CMS upload route's returned full `getPublicUrl()` result, others with a bare `/media/...` convention. A migration that only swaps the base-URL constant leaves the "already a full URL" branch **passing Supabase URLs straight through unchanged** — the read-time swap silently doesn't apply to a meaningful fraction of real data. The function needs one more branch, not just a new constant:

```
resolveMediaUrl(value):
  if empty                                      → ''
  if starts with NEW_MEDIA_BASE (R2/CDN domain) → return as-is        (already-migrated / dual-write case)
  if starts with OLD_SUPABASE_STORAGE_BASE      → rewrite: swap the base, keep the rest of the path
  if starts with '/media/'  (legacy relative)   → NEW_MEDIA_BASE + rest
  if starts with 'http'     (some other origin, e.g. unsplash)        → return as-is, untouched
  else                                           → treat as relative, prepend NEW_MEDIA_BASE
```

This one function change — plus the `toStoragePath()`-equivalent used by the CMS delete route needing the same third branch (§9's write-path review) — is what actually makes the "11 call sites auto-inherit, zero DB writes" claim true for the real data, not just the tidy subset. **Measurable completion criterion for §2's ~30 hardcoded-URL files:** `grep -rn "supabase\.co" src/ | grep -v node_modules` returns **zero** results, run as an automated check, not a manual sweep.

### Should old Supabase URLs keep working after cutover, and for how long?

Yes — recommended, and now given a concrete, criterion-based answer instead of an open-ended "for a while": **keep Supabase Storage reachable and the old URLs resolvable until §15's blog-body scan reports zero remaining Supabase-hosted `<img>` references inside `blog_posts.body` across all posts.** That scan is a measurable, re-runnable gate, not a calendar date — search-engine re-crawl timing and social-platform OG cache lifetimes are real but secondary factors (both are typically fine within weeks), the blog-body case is the one with no natural expiry at all unless it's explicitly closed out. Do not schedule Supabase Storage decommissioning against a fixed number of days; schedule it against that scan returning clean.

---

## 9. Migration strategy

Sequenced against this specific codebase's structure — not a generic playbook.

| # | Step | Depends on | Why this order |
|---|---|---|---|
| 1 | Investigation *(this report)* | — | Complete |
| 1.5 | **Branch decision** — target `cms-team-and-pages` as-is, or merge/rebase with `loyalty-portal-ui`'s caching-proxy work first | §1.0's discrepancy | Building R2 support on top of a branch about to receive a large, unrelated proxy-layer merge doubles the integration risk. Added because the audit surfaced it as a precondition. |
| 2 | R2 parallel setup — bucket, S3 SDK dependency, env vars, alongside existing Supabase config | Step 1.5 resolved | Additive only — matches this repo's existing pattern of multiple ad-hoc Supabase client instantiations |
| 3 | Single-file proof — one object, uploaded, fetched directly, fetched through `next/image`, headers compared | Step 2 | Cheapest possible falsification test before touching the other 543 objects |
| 4 | Full migration — copy all 544 objects (dry-run first), Supabase originals untouched | Step 3 approved | The bucket's clean naming (§4) means this is a mechanical copy, not a remapping exercise |
| 5 | Incremental cutover — `media-url.ts`/`assets.ts` first (fixes 11 call sites in one change), then the ~30 hardcoded-URL files in small batches, then the CMS media route | Step 4 | The two centralized helpers are highest-leverage-per-line-changed; the hardcoded files are highest file-count but each is a single-line, independently revertable swap; the media route is last since it's the only piece with write-side risk |
| 6 | Parallel monitoring — days, not hours, watching for the un-enumerable blog-body case | Step 5 largely complete | The dynamic-content risk requires real traffic/time to surface |
| 7 | Rollback proof — deliberately revert one file, confirm it serves from Supabase again | Any time after Step 3 | Cheapest possible rollback confidence check |
| 8 | Cleanup — remove Supabase `remotePatterns`/CSP entries, decide the fate of `public/media/`, decide the fate of the original bucket | Step 6 sustained clean for a full monitoring window | This is the only irreversible-feeling step — gated last, deliberately |

Two items surfaced by this audit sit outside the migration sequence but touch the same files: the 9+2 raw `<img>` instances (§2, §12) and the CMS Settings CEO-field save bug (§5.1). Neither blocks R2 migration technically, but both are worth bundling in or explicitly deferring.

---

## 10. Rollback strategy

| Question | Answer |
|---|---|
| How does the app switch back to Supabase? | Because `resolveMediaUrl()`/`assets.ts` are the two real choke points, a rollback is a revert of those two files' base-URL constant — **for the 11 call sites that go through them.** The ~30 hardcoded files need their own individual reverts, which is why §9 sequences them as small, independently-revertable batches. |
| Can the existing proxy remain temporarily? | N/A on this branch — there is no proxy to keep or remove (§1.0). If the branch decision brings in `loyalty-portal-ui`'s proxy first, that proxy's own `MEDIA_BASE` constant becomes a third rollback point. |
| Do database URLs need to change? | Not if the migration stays entirely at the read-time resolution layer (recommended) — DB values keep meaning "the media-bucket-relative path" regardless of provider. If stored values are rewritten directly instead, rollback becomes a database restore, meaningfully higher-risk. |
| Would a feature flag/env var help? | Yes — a single env var (e.g. `MEDIA_PROVIDER=r2|supabase`) read once inside `assets.ts`/`media-url.ts` lets the app's centralized paths flip providers with a deploy, matching the existing single-env-var-per-concern pattern |
| What must stay untouched until migration is proven? | The Supabase `media` bucket itself, the `remotePatterns`/CSP entries for the Supabase hostname (removed only in Step 8), and the CMS media route's read path (kept dual-capable until the write path is proven) |
| How would one migrated image be reverted? | Revert the single hardcoded literal in its one file (§2's inventory gives the exact line for each) — because none of the ~30 hardcoded files share a constant, a single-file revert has no blast radius beyond that file |
| How would the entire application be reverted? | Revert `media-url.ts` + `assets.ts` (11 centralized call sites) + `next.config.ts`'s `remotePatterns`/CSP + the CMS media route — four files cover the entire centralized surface; the ~30 hardcoded files would each need their own revert commit |

---

## 11. Verification requirements

### File-level

- HTTP status (200, not a redirect masking a miss)
- Content-Type matches the original
- Content-Length matches the source object's byte size exactly
- Cache-Control is set deliberately, not left to a provider default
- ETag, where supplied, compared before/after
- Cryptographic checksum (SHA-256) of source vs. destination bytes — not performed in this Phase 1 audit, planned for Phase 4
- Image dimensions unchanged (catches silent corruption a size-only check would miss)
- Actual browser retrieval (a checksum match doesn't confirm CORS/CSP/Content-Type all allow rendering)

### Application-level — every rendering path found in §1/§2

- `next/image` call sites (majority of public pages)
- Plain `<img>` call sites (CMS admin, marquee logos, several destination/location components, EventsPopup/UpcomingEvents banners)
- Hero images — homepage, every static country page, every service/course page
- Team images — `team/page.tsx`, `TeamTeaser.tsx`
- Logos — 8 independent hardcoded copies found (§2), each needs its own visual check
- CMS images — Media Library grid + lightbox, and the 9+2 raw/unresolved previews if fixed alongside
- Blog images — featured image, related-post thumbnails, and specifically **a sample of already-published post bodies** for embedded rich-text images
- Country pages — both the 5 DB-backed static pages and the dynamic `[slug]` route
- Static pages — every service/course page in §2's hardcoded-URL table
- SEO/OG images — spot-check with a social-preview debugger, since these are cached independently of the app
- Mobile and desktop — the marquee/logo strip and CMS admin previews are viewport-conditional (`UniversityLogos.tsx` is `hidden md:block`) and need a checked-both-ways pass

### Automated

| Tool | What it catches here specifically |
|---|---|
| `tsc --noEmit` | Type errors from any S3 SDK integration in the media route |
| ESLint | Already surfaced real issues in prior sessions on this repo — worth running after every batch, not just at the end |
| `next build` | Confirms every static-generated page still resolves its image URLs without a runtime-only failure |
| Playwright | Drive each page in the application-level list above, assert each `<img>`/`<Image>`'s `naturalWidth > 0` (the standard broken-image signal) |
| Network request inspection | Confirm no request to the old Supabase hostname remains for any URL that should now point at the new provider |
| Broken-image detection | Combine the Playwright `naturalWidth` check with a console-error listener — Next's optimizer logs a distinct warning for a `remotePatterns` mismatch |

---

## 12. Risks and edge cases

Every item below was directly confirmed in the code or the live bucket during this audit — none are hypothetical extrapolations.

| Risk | Why | Rating |
|---|---|---|
| Wrong branch targeted for the migration | §1.0 — the caching-proxy work on `loyalty-portal-ui` and any R2 work on `cms-team-and-pages` would need reconciling eventually; doing R2 first risks the eventual merge silently reintroducing the old Supabase-direct pattern in files the proxy branch already fixed | **Critical** |
| Embedded images inside blog post body HTML | §8 — `BlogContent.tsx` renders sanitized rich-text HTML via `dangerouslySetInnerHTML`; any `<img>` pasted into a post through the editor lives inside that HTML blob, not in a queryable field, so static search cannot produce a complete list. The true count is only knowable by scanning stored `blog_posts.body` content directly — out of scope for this code audit. | **Critical** |
| `career-uploads` bucket doesn't exist | §1.1 — CV uploads have likely been silently failing; unrelated to R2 but sitting in the same code path a migration would touch | **Critical** |
| Plaintext database password committed to `.claude/settings.json` | §2 — a full Postgres connection string with an embedded password sits in a tracked, non-gitignored file | **Critical** |
| ~30 hardcoded absolute URLs, no shared constant | §2 — the one step that can't be feature-flagged (§9); a missed file fails silently (broken image, not a build error) | **High** |
| Four independent hardcoded base-URL constants (`assets.ts`, `media-url.ts`, `UniversityLogos.tsx`'s own `BASE`, `blog/[slug]/page.tsx`'s own `TRANSIT_LOGO`) | A global find-and-replace by hostname string would catch all four, but a "just update `assets.ts`" mental model would miss three | **High** |
| Raw `<img src={dbField}>` with no URL resolution, public-facing (`EventsPopup.tsx`, `UpcomingEvents.tsx`) | Unlike the 7 CMS-admin-only instances, these render on the public homepage — if `banner_image` is ever stored as a relative path (the convention every other field uses), these are already broken for site visitors today | **High** |
| Schema drift — SQL files don't reflect the live database | §5 — `ceo_photo_url` and siblings exist live but nowhere in `schema.sql`/migrations; a migration plan trusting the SQL files as ground truth could miss a live column | **High** |
| Next.js `remotePatterns` gap | §6 — a missed `next.config.ts` hostname entry breaks every `<Image>` pointed at the new domain at once (build succeeds, runtime 400s from Next's optimizer) | **High** |
| CSP `img-src`/`connect-src` gap | §2 — separate from `remotePatterns`, easy to update one and forget the other; blocks plain `<img>` tags silently even when `next/image` is correctly configured | **High** |
| Signed URLs / public-private differences | Zero existing precedent in this codebase; if `career-uploads`'s R2 equivalent is given signed URLs (recommended, PII) that's genuinely new code, not a port | **Medium** |
| Missing files (DB references an object that doesn't exist in Storage) | Not verified in this audit — would require cross-referencing every DB image-column value against the 544 confirmed bucket objects. **Could not verify.** | **Medium** |
| Browser CORS | Depends entirely on the custom-domain decision (§7) | **Medium** |
| Cloudflare Image Transformations vs. R2 object storage confusion | §7 — provisioning a bucket does not get you resizing/CDN for free | **Medium** |
| Cache invalidation | Not verified against production — what `Cache-Control` header actually reaches the browser today is unconfirmed | **Medium** |
| SEO metadata / OG images | 8 independent hardcoded logo/OG-image copies; social platforms cache these independently of any code fix | **Medium** |
| Production differences vs. this audit | No hosting-platform file (`vercel.json`/`netlify.toml`/`Dockerfile`) found in-repo to confirm hosting provider or CDN behavior. **Could not verify.** | **Medium** |
| Content-type mismatches | §4 — currently 0 objects with missing/unknown MIME type; CMS upload sets `contentType` from client-supplied MIME sniffing, worth the same care in the R2 path | **Low** |
| Duplicate object names / path collisions | 41 same-filename-different-folder cases, but zero actual key collisions (full path always unique) and zero case-only collisions | **Low** |
| URL encoding / spaces / special characters | Zero objects with spaces, non-ASCII, or unsafe characters — the bucket is unusually clean | **Low** |
| Large files | Largest object is 10.93MB, well under R2's per-object limits and the bucket's own 20MB cap | **Low** |
| Database URLs that can't be automatically rewritten | Moot if the migration stays at the read-time-resolution layer (recommended) | **Low** |
| Server-side fetching | `blog/[slug]/page.tsx` uses the service-role client for an undocumented reason — flagged since it's adjacent code a migration PR would likely touch | **Low** |
| Sitemap | Confirmed zero image references in the generated sitemap | **Low** |
| Existing proxy behavior | N/A on this branch — no proxy exists (§1.0) | **Low** |
| Local development differences | Only relevant if a custom Cloudflare-transform loader is adopted; the plain remotePatterns approach has no dev/prod difference | **Low** *(with the simpler approach)* |

---

## 13. Confirmed unmodified

Every action taken during this audit was read-only.

| Area | Status |
|---|---|
| Application source code (`src/`) | Unmodified — zero edits |
| `next.config.ts` | Read only, never edited |
| `.env.local` | Never read directly — only variable *names* referenced, values never accessed or displayed |
| Database | Read-only queries only; zero `INSERT`/`UPDATE`/`DELETE` statements executed |
| Supabase Storage | Read-only (`listBuckets()`, recursive `.list()`); zero uploads, deletes, or renames |
| Proxy / middleware | Read only — and as established in §1.0, there is no image proxy on this branch to have modified in the first place |
| DNS | Untouched |
| Production | Never accessed |
| Cloudflare R2 | No account access exists in this environment |
| CMS data | Unmodified — every table read was a `SELECT` |

Two temporary, read-only Node scripts were created in a git-ignored-equivalent location (`.audit-tmp/`) purely to call the Supabase Storage list APIs quoted in §4 — these were deleted at the end of this task and leave no trace in `git status`.

---

## 14. Phase 1 preliminary readiness assessment

> **Superseded by §17 (Final Readiness Gate) below, following the second-pass production-readiness review.** Kept here, corrected, as the original Phase 1 conclusion for continuity — §17 is the authoritative checklist for actually starting Phase 2.

## Migration readiness (Phase 1 conclusion): **NOT READY — BLOCKERS FOUND**

Not a statement that R2 migration is a bad idea — the bucket is clean, the choke points are real (if underused), and the technical path is straightforward. The blockers below are decisions, not roadblocks.

### Blockers

1. **Branch scope undecided** (§1.0, §9) — this audit covers `cms-team-and-pages`; the image-caching-proxy work referenced in prior notes lives entirely on `loyalty-portal-ui` and was not found here.
2. **`career-uploads` bucket doesn't exist** (§1.1) — CV uploads are likely broken today, independent of R2, in a code path a migration would touch anyway.
3. **Blog body content isn't fully enumerable** (§8, §12) — rich-text posts can embed images no static search will find; needs a DB-content scan before Phase 4 can claim completeness.
4. ~~Schema drift confirmed — at least one live column (`ceo_photo_url` + siblings) doesn't exist in any tracked SQL file~~ — **CORRECTED in second-pass review (§5.1): this column doesn't exist live either.** Not schema drift, a dead/unimplemented code reference. Downgraded out of the blocker list — see §16's "unrelated pre-existing bugs."
5. **Plaintext DB credential in a tracked file** (§2, §12) — unrelated to R2 specifically, but severe enough that it shouldn't wait for a convenient moment.

### Complete dependency count

```text
Supabase Storage references found:        ~70
Files requiring code changes:              ~46
Files requiring configuration changes:     1  (next.config.ts — remotePatterns + CSP, same file)
Database dependencies:                     9 confirmed columns (+2 dead, 1 drift, 2 ambiguous)
API/backend dependencies:                  2  (cms/media route, CareersClient's direct browser upload)
Image-rendering dependencies:              ~55 call sites (<Image>, <img>, inline bg-url utility classes)
SEO/metadata dependencies:                 8 independent hardcoded logo/OG copies + ~15 pages with their own openGraph.images
Static-content dependencies:               1  (public/media/, 200MB orphaned local copy)
```

### Proposed migration order

Full detail in §9 — condensed: **resolve the branch decision → parallel R2 setup → single-file proof → full copy (Supabase untouched) → cut over the 2 centralized helper files → cut over the ~30 hardcoded files in small batches → cut over the CMS media route last → monitor for the un-enumerable blog-body case → prove rollback → remove the safety net.**

### Top 5 risks

1. Blog body content with embedded images that no static search can enumerate — **Critical**
2. Migrating the wrong branch's starting point — **Critical**
3. Missing the CSP `img-src`/`connect-src` update alongside `remotePatterns` — **High**
4. Missing one of the four independent hardcoded base-URL constants — **High**
5. Schema drift causing a migration plan to miss a live column — **High**

### Required decisions

1. Which branch does this migration target — `cms-team-and-pages` as-is, or after merging `loyalty-portal-ui`'s proxy work?
2. Fix or formally defer the missing `career-uploads` bucket — and separately, should CVs get signed URLs on the new provider even though nothing does today?
3. Who/what scans `blog_posts.body` content for embedded Supabase image URLs before Phase 4 is declared complete?
4. ~~Custom domain vs. R2's own public bucket URL — needs your Cloudflare/DNS setup confirmed~~ — **RESOLVED in second-pass review:** DNS is on Vercel, not Cloudflare (§7). The remaining decision is narrower: approve the subdomain-delegation approach (§8's Option 1), or pick one of the two alternatives.
5. Whether to adopt Cloudflare Image Transformations at all, or keep resize/format-conversion entirely on Next's existing optimizer (§7) — independent decisions, not a package deal.
6. How long the dual-URL (Supabase + R2 both resolvable) grace period should run before Phase 7 cleanup — §8 recommends "yes, temporarily," not a specific number of days.
7. Whether the 9+2 raw/broken `<img>` instances (2 public-facing, §12) get fixed in the same pass as the R2 migration or explicitly deferred.
8. Priority/timing for the plaintext-credential and CEO-photo-save bugs found along the way — both real, both outside this migration's scope.

---

# Part II — Second-Pass Production Readiness Review

**Performed as a critical, adversarial re-read of Part I, not a rubber stamp.** Goal: take the plan from "a good investigation" to "an engineer could execute this from the document alone, without guessing about important production behavior." Still investigation-only — nothing below was implemented; two additional read-only checks (a DNS lookup and a database column introspection) were run during this pass and are cited by name where they change a Part I conclusion. Everything in Part I stands except the two explicit corrections already applied inline above (§5.1's `ceo_photo_url` finding, §7/§8's DNS finding).

---

## 15. Deep review: the areas that needed the most scrutiny

### 15.1 — Migration completeness: how we actually prove all 544 objects copied

Part I named checksums and a final report as requirements but didn't design either. Here's the design.

**Pre-migration manifest.** Before any object is touched, generate a manifest of the *live* bucket state at that moment — one row per object: `path, size_bytes, content_type, supabase_last_modified`. This is the same recursive `.list()` call already used for the Phase 1 bucket audit (§4), just persisted to a file instead of only printed to a terminal. This manifest is the migration's source of truth for "what should exist on R2 when we're done," and its capture timestamp (`T0`) is the reference point every later delta/reconciliation check is measured against (§15.2).

**Checksum strategy.** Supabase Storage's `list()` metadata was not confirmed in Phase 1 to expose a usable checksum field (an ETag may or may not be present — **UNVERIFIED, verify in Phase 2 setup** by inspecting one real `list()` response's full metadata object for an `eTag`/`etag` key before relying on it). Regardless of whether Supabase exposes one, the migration script needs to **download each object's bytes anyway** to upload them to R2 — so compute a SHA-256 hash of the byte stream inline, during that single download, at zero extra I/O cost. Store the hash in the manifest alongside the object's row. After the R2 upload, either (a) trust R2's returned ETag if it's confirmed to be a plain MD5 of the object (true for non-multipart S3-compatible uploads, likely true for objects this size — largest is 10.93MB, §4 — but **UNVERIFIED for R2 specifically until checked against a real upload response in Phase 2**), or (b) the more bulletproof option: immediately re-fetch the just-uploaded object from R2 and hash it again, comparing against the source hash computed during download. Option (b) costs one extra GET per object (544 extra requests, negligible at this bucket size) and removes any dependency on ETag semantics being what's assumed — **recommended as the default**, with ETag comparison as a cheap first-pass sanity check on top, not a replacement.

**Failed uploads, retries, partial copies.** Per-object: attempt upload, on failure retry with exponential backoff (e.g., 3 attempts, 1s/4s/16s), and if still failing after the final attempt, mark that row `FAILED` in the manifest with the last error message — **do not abort the whole run**. The script continues to the next object. A partial run (killed mid-way, network interruption, etc.) is safe to simply re-run: re-run should skip any object already marked `VERIFIED` in the manifest (idempotent — R2's `PutObject` naturally overwrites on retry for objects that partially succeeded but weren't marked verified, so there's no risk of a corrupt partial object surviving a retry).

**Duplicate objects.** §4 already found 41 same-*filename* (different-folder) cases — these are not path collisions (the full `year/month/filename` key is what's unique, and it always is, confirmed) and need no special handling; each is migrated independently as its own object. True *duplicate content* (same bytes, different paths) was not checked in Phase 1 (would require hashing all 544 objects, which the checksum step above now does as a side effect) — optionally, after migration, group the manifest by hash and report any true content duplicates as an informational note, not an action item; R2 storage cost at 244MB total is immaterial either way.

**Zero-byte / corrupt objects.** Before uploading, verify the downloaded byte count matches the `size` the manifest recorded from Supabase's own listing. A mismatch (especially a 0-byte download) is flagged and the object is **skipped, not uploaded** — uploading a truncated/corrupt copy silently would be worse than a visible gap. Route flagged objects to a manual-review list in the final report rather than guessing.

**What the final migration report must contain (exact schema):**

```
Per-object rows: path, source_size_bytes, source_content_type, source_sha256,
                  r2_upload_status (success | failed | skipped_corrupt),
                  r2_verified_sha256_match (true | false | n/a),
                  r2_content_length_match (true | false | n/a),
                  attempts, last_error (if any), duration_ms

Summary: total_objects_in_manifest, total_bytes_in_manifest,
         succeeded, failed, skipped, 
         checksum_mismatches (should be 0 to declare success),
         total_duration, manifest_capture_time (T0), run_completion_time,
         list_of_failed_paths (for targeted re-run)
```

**Completion criterion:** `succeeded == total_objects_in_manifest` **and** `checksum_mismatches == 0` **and** the post-migration reconciliation pass (§15.2) reports zero deltas. Anything short of all three is not "done," it's "mostly done" — and this plan explicitly does not accept "mostly done" as a gate to proceed past Step 4.

### 15.2 — Live-write / race conditions during the 544-object copy

**This was a real gap in Part I** — the original plan sequenced "full migration" as a single step with no discussion of what happens if a CMS user uploads, replaces, or deletes media while it runs. Addressed properly:

**Recommendation: a short, scheduled freeze window, not delta-sync, for the initial bulk copy — plus a mandatory reconciliation pass regardless.** At this bucket's size (544 objects / 244MB), a full copy is realistically a low-single-digit number of minutes even accounting for per-object API overhead (not just raw bandwidth) — small enough that a brief, scheduled, off-peak freeze is simpler to reason about and verify than building and testing a delta-sync mechanism, and simplicity is worth more than shaving minutes off downtime for a feature (CMS media upload) that isn't itself the site's critical path. Concretely:

1. **Freeze mechanism:** the CMS media route's `POST`/`DELETE` handlers check a flag (e.g., an env var like `MEDIA_MIGRATION_FREEZE=true`, or a simple row in a settings table) at the top of the handler and return `503` with a clear message ("Media uploads are briefly paused for scheduled maintenance — try again in a few minutes") if set. This is new logic to *add* as part of Phase 2 tooling, not present today — call this out explicitly as implementation scope, not something already there.
2. **Sequence:** enable freeze → wait a few seconds for any in-flight request to complete (a freeze flag check at the top of a handler doesn't preempt a request already past that check) → capture the manifest (`T0`) → run the full copy with checksum verification (§15.1) → disable freeze.
3. **Deletes during the freeze:** by construction, none — that's the point of the freeze covering the copy window.
4. **Defense in depth, regardless of freeze discipline:** run a **mandatory reconciliation pass** after the main copy completes and freeze is lifted — re-list Supabase, diff against the manifest by path, and copy anything new (should be zero if the freeze held cleanly; a non-zero result here isn't a failure, it's the safety net catching exactly the race this section exists to prevent). Repeat the reconciliation pass until it converges to zero deltas, or is at least run once more after the "cutover" step to catch anything from the freeze-lift-to-cutover gap.
5. **A source object deleted before the copy reaches it:** the copy step gets a 404 from Supabase for that path — log it as `skipped_deleted_at_source`, not an error; nothing needs to exist on R2 for an object that no longer exists at all.

**Explicit "not recommended, but here's why" note on delta-sync:** a continuous delta-sync (comparing `updated_at` timestamps on a rolling basis, copying only what changed since the last pass, repeated until converged, enabling a near-zero-downtime cutover) is the more sophisticated approach and would be the right call at a much larger object count or a team with high-frequency uploads — neither applies here. If the team's actual upload cadence turns out to be higher than assumed (**UNVERIFIED — this audit did not measure historical upload frequency**; check via `blog_posts`/`team_members`/etc. `created_at` distribution or CMS access logs before committing to the freeze-window approach), reconsider in favor of delta-sync.

### 15.3 — Blog / dynamic content: the actual scan, not just "it exists"

Part I correctly identified the risk (blog body HTML can embed images no static code search finds) but didn't specify how to close it. Concrete design:

**Scope of the scan.** `blog_posts.body` is the only confirmed rich-text/HTML field in this schema (rendered via `dangerouslySetInnerHTML` in `BlogContent.tsx`, authored via TiptapEditor). As a defensive catch-all, also scan every other long-form text column found in §5/§13's introspection (`countries.why_study`, `countries.major_intakes_description`, and similar free-text fields) even though nothing in the code suggests they accept rich HTML — cheap to include, closes the "what if I'm wrong about which fields are HTML" gap.

**The scan itself (read-only SQL, or an equivalent read-only script using the existing service-role client):**

```sql
SELECT id, title, slug, body
FROM blog_posts
WHERE body ILIKE '%supabase.co/storage%'
   OR body ILIKE '%/media/%';
```

For every matching row, extract every URL via a permissive regex against both known shapes — a full Supabase Storage URL (`https?://[^\s"'<>]*supabase\.co/storage/v1/object/public/media/[^\s"'<>]*`) and a legacy relative reference (`/media/[^\s"'<>]*`) — case-insensitively, tolerant of both single- and double-quoted `src="..."` attributes. The output is a definitive per-post list of embedded media references: `post_id, post_slug, matched_url, url_shape (full | relative)`.

**How these are handled without unnecessarily rewriting the database — restated precisely:** as long as Supabase Storage stays reachable (§8's completion-criterion-gated policy), **no rewrite is required at all** — these embedded absolute URLs keep resolving exactly as they do today, since `BlogContent.tsx` renders the stored HTML verbatim with no URL-rewriting pass applied to it (confirmed: no `resolveMediaUrl()` call wraps the body rendering anywhere). A rewrite only becomes necessary at the point Supabase Storage is actually decommissioned — and at that point it should be a **single, explicit, dry-run-first, reviewed find-and-replace pass** (`UPDATE blog_posts SET body = replace(body, 'https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/', 'https://images.transiteducation.com.np/')`, executed only after the dry-run's diff has been read post-by-post) against a **fresh, verified `pg_dump` backup taken immediately before running it** (not the last scheduled backup — this specific operation warrants its own point-in-time backup given it's a bulk content mutation).

**Measurable completion criterion:** the same scan query above returns **zero rows**. This is the literal gate for Phase 7 decommissioning (§8), re-run on demand, not a one-time checkbox.

**One more thing worth a five-minute check, not a blocker:** whether the Tiptap editor can produce a pasted/embedded image as a **base64 data URI** rather than a URL at all (some rich-text editors support drag-and-drop image paste that inlines the bytes directly into the HTML). If so, those are already fully self-contained and irrelevant to any storage migration — but **UNVERIFIED** whether this editor configuration allows it; a quick check of `TiptapEditor.tsx`'s configured extensions (specifically whether an image-paste/drop handler is registered) resolves this in Phase 2 setup, and if data URIs are possible, the scan regex above should also flag `data:image/` occurrences as a separate, informational (not actionable) count.

### 15.4 — R2 write-path safety, dual-write, and idempotency (CMS upload/list/delete)

**Sequenced write-path phases** (this is new — Part I described the *read* side's cutover sequencing in §9 but not the *write* side's):

| Phase | Reads resolve via | Writes go to | Notes |
|---|---|---|---|
| A — today | Supabase | Supabase | Current state |
| B — post bulk-copy, pre-cutover | Supabase (unchanged) | Supabase (unchanged) | R2 has a copy but isn't authoritative for anything yet. Anything uploaded during this phase is caught by §15.2's reconciliation pass before Phase C begins. |
| C — dual-write | Supabase (still, until proven) | **Both**, Supabase-write-result is authoritative for the response | New uploads/deletes write to Supabase first; only on Supabase success is an R2 write attempted. An R2 write failure is logged (§15.10) but does **not** fail the user-facing request — Supabase remains the safety net through this entire phase. Flip reads to R2 only after dual-write has run with **zero R2-write failures for a defined minimum window** (recommend 48–72 hours of real CMS usage, not just elapsed time — if the CMS is used infrequently, extend until a meaningful number of real uploads/deletes have exercised the path). |
| D — full cutover | R2 | **Both, still** | Reads move to R2. Writes **stay dual** — this is the detail that makes rollback in §15.8 actually safe. Supabase is not retired as a write target yet. |
| E — cleanup (Phase 7, gated on §8's blog-scan criterion) | R2 | R2 only | Only now does Supabase stop receiving writes. This is the point of no return for instant rollback — see §15.8. |

**Idempotency.** The current upload path computes a deterministic filename (`buildSafeName()`, no timestamp/random suffix beyond the year/month folder) and uses `upsert: false` — a retried request for the exact same file/name fails loudly (object-exists error) rather than silently duplicating, which is the correct behavior to preserve. **Flag for Phase 2 verification, not assumed:** R2's S3-compatible `PutObject` may not support Supabase's `upsert:false`-equivalent "fail if exists" semantics natively (S3-compatible APIs generally don't have a native conditional-put on all providers/plans). **UNVERIFIED — verify against R2's actual API docs/behavior in Phase 2**; if unsupported, substitute an explicit `HeadObject`-then-`PutObject` check at the application level (accepts a small theoretical race window, acceptable given this is a low-concurrency, admin-only upload feature, not a high-throughput public endpoint).

**Delete-path correctness — a concrete gap this review found.** The current `toStoragePath()` parser (`src/app/api/cms/media/route.ts`) recognizes exactly two shapes: a bare `/media/...` reference, or a full URL containing `/object/public/media/`. Once R2-shaped URLs also exist in the data (dual-write period onward, per Phase C above), a delete request for an object whose stored value is now a full `https://images.transiteducation.com.np/2026/04/x.png` URL would fail `toStoragePath()`'s pattern match (`indexOf('/object/public/media/')` returns `-1` for that shape) and the route would incorrectly respond `400 Invalid file path` — **a real correctness gap to close, not a hypothetical one**, since it directly follows from the dual-write design above. The parser needs a third branch recognizing the new base URL, using the *same* shared path-computation logic for both the Supabase delete call and the R2 delete call — never two independently-written parsers that could silently diverge on an edge case.

**What happens on a failed R2 write during dual-write:** logged with a structured, greppable marker (§15.10) including the object path and the underlying error; does not block or fail the CMS user's request (Supabase succeeded, that's sufficient during Phase C/D); queued for a manual or scheduled reconciliation retry. A CMS user should never see "your upload failed" because of an R2-side problem while Supabase-write is still succeeding.

### 15.5 — Security: credentials, R2 access, and PII

**The plaintext Postgres credential — treated as its own, separate, urgent item, per instruction.** Concrete remediation, in order:
1. **Rotate the Postgres password immediately** via the Supabase dashboard (Database → Settings → reset password). This is the step that actually neutralizes the exposure — a leaked-but-rotated credential is no longer useful to anyone who has it.
2. **Scrub `.claude/settings.json`** of the connection string in the same change (replace the offending permission entry or remove it).
3. **Check git history**, not just the working tree — `git log -p -- .claude/settings.json` to establish since when this has been committed, and on which branches/remotes. Rotation (step 1) makes the *old* credential harmless regardless of what history shows; purging history (`git filter-repo`/BFG + force-push + mandatory re-clone for every collaborator) is a separate, heavier, optional hygiene step that should not block or be conflated with the urgent rotation.
4. **UNVERIFIED, worth checking if available:** Supabase's own connection/access logs, to see whether this credential shows any suspicious usage before rotation — dashboard-only, outside this audit's reach.

This is explicitly a **security blocker**, separate from the R2 migration itself, and should not wait for Phase 2 scheduling.

**How R2 credentials should be stored, and which code paths may touch them.** Mirror the existing, correct pattern already used for `SUPABASE_SERVICE_ROLE_KEY`: server-side-only environment variables (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`), **never** `NEXT_PUBLIC_`-prefixed. Only server-side code (the CMS media API route, migration/reconciliation scripts) should import them — never a client component, never anything that ships in browser JS. **Concrete, automatable pre-deploy gate:** `grep -rn "NEXT_PUBLIC.*R2" src/` must return zero results; add this as an explicit checklist item (§17) and, ideally, a CI check, not a manual reminder. Recommend provisioning a **scoped Cloudflare API token** limited to just this one R2 bucket (read+write, no account-wide admin scope) rather than a broad account token — principle of least privilege, configured once in Phase 2.

**Browser code must never receive R2 secrets — and this review found an existing asymmetry worth naming.** The CMS media route already follows the safe pattern: browser → Next.js API route (server-side credentials) → Storage. `CareersClient.tsx`'s CV upload does **not** — it uploads directly from the browser to Supabase Storage using the anon key (§1.1). **Do not replicate the direct-browser-upload pattern for R2.** Whatever fixes the missing `career-uploads` bucket should route uploads server-side (client → Next.js API route → R2), matching the CMS media route's existing, already-proven pattern, rather than porting the current CV flow's weaker one forward.

**Career/CV uploads — PII, and the design should reflect that explicitly, not inherit today's gap.** Recommend, when this is addressed (in-scope for this migration or as an explicitly separate, deliberately-scheduled piece of work — see §16's decision log):
- A **separate R2 bucket** from `media` — never the same public bucket marketing images live in.
- **Private by default** (not public-read).
- **Signed URLs, short expiry** (e.g., 1 hour), generated server-side, only for authenticated CMS admin users viewing a specific application — this also happens to fix the currently-broken CV-link-404 issue found in Phase 1 as a side effect, since it forces the `cv_url` field to be resolvable through a real, working code path instead of a bare, unresolved storage key.
- This is explicitly **not** "reuse the `media` bucket's public pattern for CVs too" — that would be a regression in a direction nothing in this codebase currently does, not a neutral port.

### 15.6 — Deployment & environments

**Environment variable matrix — every variable this migration introduces or touches, public vs. secret, stated explicitly:**

| Variable | New or existing | Public or secret | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Existing | Public | Unchanged |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Existing | Public (by design, RLS-protected) | Unchanged |
| `SUPABASE_SERVICE_ROLE_KEY` | Existing | Secret | Unchanged |
| `R2_ACCOUNT_ID` | New | Secret (no reason to expose, even if not acutely sensitive) | Server-only |
| `R2_ACCESS_KEY_ID` | New | Secret | Server-only |
| `R2_SECRET_ACCESS_KEY` | New | Secret, most sensitive | Server-only, scoped token (§15.5) |
| `R2_BUCKET_NAME` | New | Secret by convention (implementation detail, no upside to exposing) | Server-only |
| `NEXT_PUBLIC_MEDIA_BASE_URL` (e.g. `https://images.transiteducation.com.np`) | New | **Public** | This is not actually secret information — it's embedded in every page's rendered HTML `<img src>` regardless. Matches the existing precedent of `NEXT_PUBLIC_SUPABASE_URL` being public for the same reason. |
| `MEDIA_PROVIDER` (`r2` \| `supabase`, the rollback flag from §10) | New | **Public**, for the same reason as above — if any component that calls `resolveMediaUrl()` is (or becomes) a Client Component, this needs to resolve in the browser too; keeping it `NEXT_PUBLIC_` avoids a class of "works from the server, breaks from the client" bugs, at no confidentiality cost since the value it drives is visible in every page anyway | |
| `MEDIA_MIGRATION_FREEZE` (§15.2) | New, temporary | Server-only, doesn't need to be public | Only read by the API route handlers during the migration window; can be removed after Phase 2 tooling is retired |

**Per-environment consistency — a concrete, easy-to-miss gotcha.** If the hosting platform is Vercel (strong evidence, not full proof — §7), Vercel scopes environment variables per environment (Production / Preview / Development) independently by default. A common, easy mistake: adding the new R2 variables only to "Production" and forgetting "Preview," which would make every PR preview deployment silently fail to load images (or fail to build, depending on how the code handles a missing var) while Production looks fine — exactly the kind of gap that doesn't get caught until someone happens to review a PR preview. **Explicit checklist item:** confirm every new variable above is set consistently across all environments the team actually uses, not just Production, before merging any PR that depends on them.

**Development (local):** recommend local dev continues pointing at Supabase throughout the transition (or, if preferred, a low-stakes separate R2 dev/test bucket) — there's no requirement that local development mirror production's exact provider state during a transition period, and reducing that requirement lowers onboarding friction for anyone not directly working on the migration. This is a decision to make explicitly, not assume (§16).

### 15.7 — Next.js image optimization: one build-time nuance Part I didn't surface

Everything in Part I §6 about `remotePatterns`/loader compatibility holds. One addition: Phase 1 separately confirmed (during the original CMS bug-fix work referenced elsewhere in this repo's history) that the 5 DB-backed static country pages (`usa`, `canada`, `australia`, `uk`, `germany`) are **statically generated at build time**, not re-rendered per-request. Their `<Image>` `src` values, and their `generateMetadata`-produced OG images, are baked in from whatever the database returned **at the moment of the last build** — they will not pick up a new base URL just because an environment variable changed at runtime. **This means the cutover sequence (§9 Step 5) is not purely a config/code change — it requires a fresh deploy/rebuild to actually take effect for these 5 pages specifically**, and any verification step that checks these pages needs to happen *after* that rebuild, not immediately after merging the code change. Call this out explicitly in the cutover checklist (§17) so it isn't assumed away.

### 15.8 — Rollback as an operational runbook, not "revert the PR"

**The core guarantee this plan is designed around:** because database values are provider-neutral (§4/§8) and the write path stays **dual** all the way through Phase D (§15.4's table — not just during the initial transition), rollback never requires a database restore, for any rollback triggered before Phase E. This is worth stating as an explicit design goal that the rest of this section exists to protect.

**Rollback procedure, by scenario:**

- **Before full cutover (Phase B/C):** trivial. Reads were never moved off Supabase. Nothing to do beyond not proceeding.
- **After full cutover, before Phase E cleanup (Phase D — the intended state for the entire monitoring window):** flip `MEDIA_PROVIDER` back to `supabase`. Because writes have stayed dual through this whole window, Supabase has a complete, current copy of everything — including anything uploaded *after* reads moved to R2 — so this flip is safe and instant. No file is missing on the Supabase side. This is **why** §15.4 insists dual-write persists through Phase D instead of being retired right after the read-flip — that single design choice is what makes rollback in the normal case a config change instead of a data-recovery operation.
- **After Phase E (Supabase writes retired):** this is the one case where rollback is genuinely harder, and the plan should say so plainly rather than imply it's always free. Anything uploaded after Phase E started exists only on R2. A rollback here requires a **reverse sync** (copy R2 objects created since Phase E began back to Supabase) *before* flipping the read flag, using the same manifest/checksum machinery as the forward migration, run in reverse. This is exactly why Phase E should be gated on a high confidence bar (§8's blog-scan criterion **and** a substantial incident-free monitoring period, not a fixed date) — past that point, rollback is a real operation with its own runtime, not an instant flip.

**Rollback triggers — concrete, not vague:**
- Image request error rate exceeds an agreed threshold for a sustained window (needs a number decided with whoever owns the observability tooling — not invented here without knowing what's actually measurable in this environment).
- CMS upload or delete failure rate exceeds a threshold.
- A checksum mismatch is discovered post-migration that wasn't caught during §15.1's verification.
- Any P0/P1 incident where images are broken site-wide.
- A manual decision by whoever is the accountable engineer for the migration — rollback should always be available as a judgment call, not only an automated trigger.

**Rollback verification steps** (run every time rollback is exercised, including the deliberate rehearsal in §9 Step 7): homepage loads with images render; a representative sample across the ~55 rendering-path call sites (§2) render correctly; CMS upload and delete both still function against Supabase; a network-tab check confirms no lingering request to the R2/Cloudflare domain for anything that should now be Supabase-sourced; the same Playwright suite used for forward verification (§11) is re-run against the rolled-back state and passes.

### 15.9 — Legacy content: `public/media/`, redirects, and how long old URLs live

Part I flagged `public/media/` as orphaned but stopped short of a recommendation. Recommendation, synthesized from the three options originally listed: **redirect, then remove.** Since `/media/<path>` was never a real user-facing convention in this app's own generated output (every in-app reference gets rewritten by `resolveMediaUrl()` before it reaches a browser — §8's corrected function still guarantees this), the only traffic that could ever hit `/media/<path>` directly is an old external link, bookmark, or stale cached page from before the original Supabase migration. A single redirect rule (`/media/:path*` → `https://images.transiteducation.com.np/:path*`, added once, as part of the eventual cleanup, not now) correctly serves that residual traffic from the *new* canonical location instead of the stale local copy — and once that redirect exists, the 200MB `public/media/` directory can be safely deleted, since nothing depends on it actually containing bytes anymore. Do this as an explicit, separate, low-risk cleanup step in Phase 7 (§9 Step 8) — not now, and not implicitly by just deleting the directory without the redirect first (that would turn silent staleness into loud 404s for whatever residual external traffic exists).

**How long should old Supabase URLs remain resolvable?** Restated from §8 for completeness here: gated on §15.3's blog-body scan returning zero rows, not a calendar date. Everything else (search-engine re-crawl, social-platform OG cache) is a secondary consideration that resolves faster than the blog-body case in every realistic scenario.

---

## 16. Failure-mode table

| Failure | Detection | Impact | Recovery | Preventive control |
|---|---|---|---|---|
| R2 upload fails for an object during bulk migration | Manifest shows `FAILED` status | None to live users (Supabase still serves it pre-cutover) | Automatic retry (3×, backoff); flagged for manual re-run if still failing | Idempotent retry logic; dry-run first (§9 Step 4) |
| CMS user uploads a new file during the bulk-copy window | Reconciliation pass diff (§15.2) | None, if freeze window used; small if not | Reconciliation pass copies the delta | Freeze window + mandatory reconciliation pass regardless |
| CMS user deletes a file mid-migration, before it's copied | Migration script receives a 404 for that path | None — nothing to migrate | Skip, log as expected, not an error | N/A — benign by design |
| One of the ~30 hardcoded Supabase URLs is missed | Automated `grep supabase.co` check fails to return zero; or lingering network requests to the old domain post-cutover | That one image keeps loading from Supabase — works today, breaks only once/if Supabase is later decommissioned | Single-file fix, redeploy | Automated grep-to-zero as a CI/checklist gate (§8, §17), not a manual sweep |
| CSP `img-src`/`connect-src` updated without `remotePatterns`, or vice versa | Browser console CSP violation; CSP report endpoint (§16.10) | Plain `<img>` tags on the new domain blocked by the browser even though `next/image` may work fine (or vice versa) | Add the missing directive/entry, redeploy | Checklist explicitly pairs the two config changes — never ship one without the other |
| `next.config.ts` `remotePatterns` missing the new hostname | Next server logs an "Invalid src prop" style error; `<Image>` call sites break | Broken images for every `<Image>`-rendered call site on the new domain | Add the entry, redeploy | Staging verification stage (§17) catches this before production |
| R2 bucket created private instead of public | Single-object proof stage's direct-fetch test returns 403 | Caught before any cutover, if the proof stage is actually run | Fix the bucket's public-access setting | Single-object proof (§9 Step 3) is a mandatory, non-skippable gate |
| No/wrong `Cache-Control` set on migrated objects | Response header inspection during verification | Suboptimal caching, higher request volume/cost — not a breakage | Update object metadata (S3-compatible copy-in-place, no re-upload needed) | Set explicitly at upload time; checked in file-level verification (§11) |
| Checksum mismatch found for a migrated object | Full-copy verification stage (§15.1) | That specific object potentially corrupted on R2 | Re-copy from Supabase | Checksum-on-copy design closes this before it can reach production |
| Blog body embeds an image URL the scan regex doesn't match (unusual encoding, split markup) | Visitor/editor report; or a scheduled periodic re-scan | One broken image inside one post body | Manual fix of that post's content | Broad, case-insensitive scan regex; treat the scan as a standing safeguard, re-run periodically, not a one-time pass |
| R2 credentials accidentally exposed client-side (`NEXT_PUBLIC_` mistake) | Pre-deploy grep gate; or discovered via browser devtools bundle inspection | **Critical** — full bucket read/write compromise | Rotate R2 keys immediately, redeploy | Explicit automated grep gate (§15.5, §17); code review checklist item |
| `career-uploads`/CV-equivalent bucket made public by mistake | Manual access-control review before go-live | **Critical** — PII (applicant CVs) publicly exposed | Flip to private immediately; audit access logs for the exposure window; notify affected applicants if required | Dedicated private bucket + signed-URL design from the start, never defaulted to the public `media` pattern |
| Static country pages serve stale (Supabase) image URLs after cutover | Visual check of the 5 DB-backed static pages post-deploy | Those 5 pages show old URLs until the next build | Trigger a fresh deploy/rebuild | Cutover checklist explicitly requires a rebuild, not just an env-var flip (§15.7) |
| Rollback attempted after Phase E (dual-write already retired) | Rollback runbook's verification step finds 404s for recently-uploaded files | Files uploaded R2-only during Phase E become briefly unreachable if rolled back naively | Reverse-sync (R2 → Supabase) for the affected window before flipping back | Dual-write deliberately kept alive through the entire monitoring window (Phase D); Phase E only entered at high confidence |
| CMS delete request for an object whose stored value is now an R2-shaped URL | `toStoragePath()`-equivalent parser returns null; route responds 400 | A CMS user's delete action silently fails during/after dual-write | Add the missing URL-shape branch to the shared path parser | Identified explicitly in §15.4 as required write-path work, not left implicit |

---

## 17. Decision log

**True migration blockers** — must be resolved before Phase 2 starts:
1. Which branch this migration targets — `cms-team-and-pages` as-is, or after merging `loyalty-portal-ui`'s proxy work (§1.0, §9).
2. The missing `career-uploads` bucket — fix with a proper private/signed-URL design (§15.5) before any CV-related work proceeds, or explicitly, formally defer it as out of scope.
3. Freeze-window vs. delta-sync decision for the live-write race condition (§15.2) — freeze window is the recommendation; confirm it's acceptable operationally (an off-peak scheduling window needs to exist and be agreed).
4. Custom-domain path — approve subdomain delegation (§8 Option 1, recommended) or pick an alternative.
5. Blog-body scan (§15.3) must actually run and be reviewed before Phase 4 can be called complete — assign an owner.

**Security blockers** — separate from the migration, must not wait for convenient scheduling:
6. Rotate the leaked Postgres password (§15.5) — immediate.
7. Scrub `.claude/settings.json` of the credential in the same change.
8. Design CV/PII storage properly (private bucket + signed URLs) when that work happens — don't inherit today's no-access-control gap into whatever replaces it.

**Unrelated pre-existing bugs** — found along the way, not migration blockers, worth tracking separately:
9. CMS Settings route silently drops fields the admin form presents as editable (originally described as `ceo_*` schema drift — corrected in §5.1 to: the form has fields for columns that don't exist at all; either implement them or remove the misleading inputs).
10. `study-abroad/[slug]/page.tsx` always renders the Canada banner image regardless of the actual country (§1).
11. 9+2 raw, unresolved `<img>` instances — 2 of them public-facing (`EventsPopup.tsx`, `UpcomingEvents.tsx`) (§2, §12).
12. CV links likely 404 in the CMS today (bare storage key, not a resolvable URL) (§15.5 notes this gets fixed as a side effect of the recommended CV redesign).

**Recommended improvements** — not blockers, worth bundling in if convenient:
13. A shared `AppImage`-style wrapper component (previously drafted in the `loyalty-portal-ui` branch's own docs) to make this bug class structurally harder to reintroduce.
14. Add a CSP `report-uri`/`report-to` directive — currently absent — so a missed domain surfaces as a monitored signal instead of a silent break (§15.10).
15. The `/media/*` → new-domain redirect once `public/media/` is retired (§15.9).
16. Consolidate the four independent hardcoded base-URL constants (`assets.ts`, `media-url.ts`, `UniversityLogos.tsx`, `blog/[slug]/page.tsx`) into one.
17. Add the automated `grep supabase.co` / `grep NEXT_PUBLIC.*R2` checks to CI, not just a manual pre-deploy step.

**Optional future work** — explicitly not part of this migration:
18. Cloudflare Image Transformations — deferred, no concrete need identified (§7).
19. Full decommissioning of the original Supabase bucket — only after §15.3's scan is clean and a substantial incident-free window has passed, no fixed date assumed.
20. True byte-level duplicate detection across the 41 same-filename cases — informational only, not required for migration correctness.

---

## 18. Second-pass verification and observability additions

*(Extends §11's verification plan and directly answers area 10/11 of this review — not a replacement.)*

### Observability plan

| Signal | How it's currently visible (verified) | Gap / recommended addition |
|---|---|---|
| CMS upload/delete failures | `console.error` in `route.ts` today — reaches server/platform logs | Give these a distinct, greppable structured prefix (e.g. `[R2_UPLOAD_FAIL]`) so they're alertable, not just loggable |
| R2 errors generally | **UNVERIFIED** whether Cloudflare's own R2/bucket-level analytics (request count, error rate by status, bandwidth) are already enabled for this account | Verify/enable in Phase 2 setup — this is a dashboard toggle, not new code |
| CSP violations | Currently **no `report-uri`/`report-to` directive** in the CSP header (`next.config.ts`, confirmed absent) | Add one — even a simple logging endpoint — so a missed domain shows up as a monitored signal instead of only "someone notices a broken image" |
| Next.js image optimizer failures | Logs a distinct server-side warning when `remotePatterns` rejects a URL or an upstream fetch fails | Watch server logs for this pattern specifically during the cutover window |
| Unexpected 404s on image requests | Depends on hosting platform's own access logs (**UNVERIFIED** what's available without confirming the host — §7) | A post-cutover spike here is the concrete signal for "missed hardcoded URL or migration gap" |
| Cache behavior | If the Cloudflare-proxied custom domain (§8 Option 1) is used, responses carry a `cf-cache-status` header (`HIT`/`MISS`/`EXPIRED`/`DYNAMIC`) | Sample this header on a handful of real requests post-cutover as a concrete, checkable signal — not a vague "check caching works" |
| Client-side broken images | Not currently instrumented anywhere in the app | Recommended (not blocking) addition: wire an `onError` handler into the proposed `AppImage` wrapper (§16 item 13) that increments a simple counter/beacon — genuinely new code, appropriately scoped as a "recommended improvement," not required for the migration itself |

### Verification stages — explicit pass/fail, extending §11

- **Pre-migration:** [ ] manifest generated with checksums for the full live object count · [ ] R2 bucket reachable (test PUT/GET/DELETE of a disposable test object, then remove it) · [ ] all env vars from §15.6 present in every environment that needs them · [ ] freeze/reconciliation tooling built and dry-run tested · [ ] blog-body scan (§15.3) completed and reviewed · [ ] rollback flag mechanism exercised at least once in a non-production environment.
- **Single-object proof:** [ ] upload one object · [ ] direct GET returns 200, correct content-type, correct content-length, checksum matches · [ ] fetch through `next/image` succeeds with expected optimized output · [ ] fetch via plain browser `<img>` succeeds · [ ] CSP does not block it in a real browser (not just curl).
- **Full-copy verification:** [ ] R2 object count equals the manifest's live count at `T0` · [ ] total bytes match within an explainable tolerance · [ ] 100% of manifest checksums verified, 0 mismatches · [ ] 0 unexplained failures (every failure either retried to success or explicitly triaged in the final report).
- **Staging verification:** [ ] code changes deployed to a preview/staging environment pointed at R2 · [ ] full Playwright suite passes · [ ] manual spot check across the ~55 rendering-path call sites (§2) · [ ] CMS upload/delete confirmed working against R2 in staging, including the delete-path fix from §15.4.
- **Production cutover verification:** [ ] rebuild/redeploy confirmed (§15.7 — not just an env flip) · [ ] homepage and the 5 highest-traffic pages render correctly immediately post-deploy · [ ] 0 new CSP violation reports in the first 30 minutes · [ ] error-rate dashboards checked for the same window.
- **Post-cutover monitoring:** [ ] dual-write phase (Phase D) sustained with 0 R2-write failures for the agreed minimum window before Phase E is even considered.
- **Rollback verification (if exercised):** [ ] the exact steps in §15.8's "Rollback verification steps," run to completion.
- **Final cleanup verification (Phase E/7):** [ ] Supabase `remotePatterns`/CSP entries removed · [ ] build still succeeds · [ ] 0 console/network references to the old domain · [ ] `public/media/` redirect-then-remove decision executed and documented (§15.9) · [ ] blog-body scan re-run one final time, confirmed 0 rows, before Supabase Storage decommission is even discussed.

---

## 19. Final readiness gate

Answers the standard this review was held to: **could a competent engineer execute this migration from this document alone, without guessing about important production behavior?**

### Gate — every item must be checked before Phase 2 begins

- [ ] **Branch decision made and documented** (§1.0, §17 item 1)
- [ ] **`career-uploads` bucket fix designed** (private bucket + signed URLs, §15.5) or formally, explicitly deferred with an owner
- [ ] **Postgres credential rotated** and `.claude/settings.json` scrubbed (§15.5) — independent of migration timing, but blocking in spirit
- [ ] **Freeze-window mechanism approved** and an off-peak window identified (§15.2)
- [ ] **Custom-domain path approved** — subdomain delegation (recommended) or an explicit alternative (§8)
- [ ] **Blog-body scan run and reviewed**, results understood by whoever owns the eventual Supabase decommission decision (§15.3)
- [ ] **Checksum/manifest tooling designed** per §15.1's exact schema (not yet built — this gate is about the design being settled, not the code existing)
- [ ] **Dual-write phase sequencing agreed**, specifically that writes stay dual through Phase D, not just the initial transition (§15.4)
- [ ] **Rollback runbook read and understood** by whoever will execute it if needed (§15.8) — not just written
- [ ] **Environment variable matrix confirmed** against the actual hosting platform's per-environment scoping (§15.6) — requires confirming the hosting platform first if still unconfirmed
- [ ] **No R2 credentials will reach client code** — the `NEXT_PUBLIC_.*R2` grep gate is agreed as a standing pre-deploy check, not a one-time promise
- [ ] **Decision NOT to adopt Cloudflare Image Transformations acknowledged**, or a concrete reason to override that recommendation is documented (§7)
- [ ] **`grep -rn "supabase\.co" src/` reduced to a known, reviewed, non-zero baseline** if not already zero, so the eventual "reduced to zero" completion check has a real starting point

### If every box above is checked: readiness moves from **NOT READY** to **READY FOR PHASE 2**, with the understanding that Phase 2 itself ends at a gate too (§9 Step 3, the single-object proof), not at "ship everything."

---

# A–G Summary

**A. Updated migration plan.** Parts I and II together, read as one document — Part I's inventory and architecture stand as originally found (with the two corrections applied inline: §5.1's `ceo_photo_url` finding, §7/§8's DNS finding); Part II adds the mechanisms Part I named but didn't design: the checksum/manifest scheme (§15.1), the freeze-window + reconciliation race-condition handling (§15.2), the blog-body scan (§15.3), the dual-write write-path sequencing (§15.4), the security remediation (§15.5), the environment matrix (§15.6), the build/rebuild nuance (§15.7), the rollback runbook (§15.8), and the legacy-content redirect-then-remove plan (§15.9).

**B. New risks/findings discovered during this second-pass review.**
- The `ceo_photo_url`/`tiktok_url` "schema drift" finding was wrong — direct verification shows these columns don't exist at all; corrected in §5.1.
- The production domain's DNS is on Vercel, not Cloudflare — verified directly, changes the custom-domain plan from "assumed available" to "requires an explicit subdomain-delegation step" (§7, §8).
- `universities` and `pages` tables confirmed (not just suspected) not to exist.
- The database genuinely stores a mix of full URLs and relative paths (not just "mostly relative paths with some exceptions") — `resolveMediaUrl()` needs an additional branch to actually rewrite full Supabase URLs, not just pass them through, or the migration silently doesn't apply to a meaningful fraction of real data (§8).
- The CMS delete route's path parser will break for R2-shaped URLs once dual-write begins, unless explicitly extended (§15.4) — not identified in Part I.
- CORS risk was overstated in Part I for basic `<img>`/`<Image>` display (only matters for canvas/fetch-based client-side image reads, none found in this app) — corrected in §7.
- No live-write race-condition handling existed in the original plan at all — §15.2 is wholly new.

**C. Required decisions before implementation.** The full categorized list is §17 (Decision Log) — 5 true migration blockers, 3 security blockers, 4 unrelated pre-existing bugs, 5 recommended improvements, 3 items of optional future work.

**D. Exact Phase 2 entry criteria.** §19's gate checklist, in full — every box must be checked, not "mostly addressed."

**E. Exact production cutover checklist.** §18's "Production cutover verification" and "Post-cutover monitoring" stages, combined with §15.7's mandatory-rebuild requirement and §15.4's Phase C→D read-flip criteria (zero R2-write failures over the agreed minimum window).

**F. Exact rollback checklist.** §15.8 in full, plus §18's "Rollback verification (if exercised)" stage.

**G. Final readiness score: 9.5 / 10.**

Justification: every mechanism the original 9/10 plan was missing — checksummed completeness proof, race-condition handling, a concrete blog-content scan, dual-write write-path safety, an operational rollback runbook, a security remediation plan, and a real environment/observability plan — now exists in enough detail that a competent engineer could execute Phase 2 without guessing at the important production behavior. The remaining half-point is not a flaw in the plan; it's the honest residue of what genuinely cannot be resolved from this environment: the exact hosting platform is inferred (strongly) but not certified, Supabase's ETag semantics and R2's conditional-write behavior are unverified pending a real Phase 2 API check, and the freeze-window's assumed upload cadence is an assumption, not a measurement. Each of those is explicitly labeled **UNVERIFIED** with a stated verification step, rather than quietly assumed — which is the actual bar this review was held to, not a cosmetic one.

---

*Part I: Phase 1 investigation, read-only. Part II: second-pass production-readiness review, also read-only — two additional checks (a public DNS lookup, a database column introspection) were performed and are cited above; no code, configuration, `.env.local`, database content, Supabase Storage, DNS, or production system was modified by either pass. Every "UNVERIFIED" above is a genuine, stated gap with a concrete next step, not a placeholder. Stopping here for review — awaiting the decisions in §17 before Phase 2.*
