# Image Delivery & Cached Egress — Final Blueprint

Builds directly on the completed audit (`docs/supabase-egress-audit.md`) and the production evidence you've since gathered (proxy hit-rate ≈56.7%, `/_next/image` hit-rate ≈69%, 60s–31536000s cache-control spread across Storage objects, `.vercel.app` cold-cache exposure). No further scanning below — this is the decision and the plan. **No code changed in this task.**

---

## 1. Executive Summary

The proxy works. The problem is that **not everything goes through it.** Every `<Image>` that resolves to a raw Supabase URL (via `resolveMediaUrl()` or a hardcoded string) inherits whatever Cache-Control that *specific object* happens to have — and that ranges from 60s to 1yr depending on when/how it was uploaded. Team page and the homepage testimonial/success-story carousel are the proven, highest-traffic instances of this pattern, but the same bug class exists on every other page that uses `next/image` against a Supabase URL directly (locations, study-abroad, services, courses — all previously "compliant" under the old two-pattern convention). The `.vercel.app` alias compounds it by giving any bot a way to force a full cold-cache burst outside your custom domain's warm cache.

**Decision: standardize on a hybrid architecture — the proxy becomes the *only* origin, `next/image` stays as the *only* transform/resize layer, and they compose (Section 3).** Ship the two proven fixes today as isolated commits; treat the rest as a 5–7 day mechanical migration behind one already-centralized choke point (`media-url.ts`).

---

## 2. Recommended Canonical Image Architecture

| | **A. next/image only** | **B. /api/images only** | **C. Hybrid (recommended)** |
|---|---|---|---|
| Cache-control consistency | ❌ Inherits Supabase's per-object mess — this is the root cause you just proved | ✅ Proxy always forces one value | ✅ Proxy forces one value; next/image inherits *that*, not Supabase's |
| Resize/format (AVIF/WebP/srcset) | ✅ | ❌ pure passthrough, no transform | ✅ next/image still does this |
| Bandwidth to origin (Supabase) | Medium-High (per-object cache misses) | Low (proxy cache-control is uniform + long) | Lowest — uniform cache-control *and* right-sized/format-negotiated bytes |
| Migration cost | None (status quo) | Loses resizing — real regression on large images (the 47MB burst is partly "unresized originals") | Low — one function already exists (`proxiedMediaUrl`), just needs to be the value fed to `<Image src>` too |
| Best-practice alignment | Standard Next.js pattern, but assumes a well-behaved origin — Supabase's origin isn't | Not idiomatic Next.js; discards a feature you're paying performance for already | Idiomatic: same-origin URL fed to `next/image`, which is exactly what `remotePatterns`/self-hosted-image proxying is designed for |

**Why C, precisely:** point every `<Image src>` at `/api/images/<path>` (same-origin, relative — no `remotePatterns` entry even needed) instead of the raw `https://...supabase.co/...` URL. Next's optimizer then fetches from your own proxy, which always answers with `Cache-Control: public, max-age=31536000, immutable` regardless of what any given Storage object's metadata says. The proxy absorbs Supabase's inconsistency; `next/image` still does its job on top. This requires **no new component and no new caching layer** — it's `proxiedMediaUrl()` (already written, already used for the `<img>` path) becoming the single URL source for *both* rendering methods, not two parallel conventions.

The Supabase-hostname entry in `next.config.ts` `remotePatterns` stays for now (safety net during rollout) and gets removed once Section 5's inventory is fully migrated.

---

## 3. Current Image Pipeline — Reclassified Under the New Standard

Everything below was inventoried in the prior audit; this table re-tags each against the **new** hybrid standard (previously several of these were "compliant" under the old dual-pattern rule — that rule is now retired).

| Path | Pattern | Status | Note |
|---|---|---|---|
| `Hero.tsx:212-219` (testimonial avatar strip) | Hardcoded absolute URL → `<Image>` | 🔴 **Proven root cause — fix today** | 5 static URLs, zero cache normalization |
| `Hero.tsx:254` (success-story image) | `resolveMediaUrl()` → `<Image fill>` | 🔴 **Proven root cause — fix today** | Largest byte-weight of the two; `fill` + `priority` |
| `team/page.tsx:82,125` (leadership + staff photos) | `resolveMediaUrl()` → `<Image fill>` | 🔴 **Proven root cause — fix today** | Two separate loops, same bug |
| `locations/[slug]/page.tsx` (hero + gallery, 4 `<Image>` calls) | Hardcoded absolute URL → `<Image>` | 🟠 Needs migration | Same bug class, not yet measured but structurally identical |
| `study-abroad/*`, `services/*`, `courses/*`, `about`, `blog`, `resources`, `team` hero banners | Hardcoded absolute URL → `<Image>` | 🟠 Needs migration | ~15 files, all static hero images |
| `UniversityLogos.tsx`, `TeamTeaser.tsx`, `Testimonials.tsx`, `SuccessStories.tsx`, `CEOMessage.tsx`, `LatestBlog.tsx` | `proxiedMediaUrl()` → `<img>` | ✅ Correct | No change needed |
| `country/CountryDestinationPage.tsx`, `destinations/DestinationContent.tsx` | `proxiedMediaUrl()` → `<img>` | ✅ Correct | No change needed |
| `RewardsGrid.tsx`, `RewardsCarousel.tsx` (loyalty portal) | `proxiedMediaUrl()` → `<img>` | ✅ Correct | Fixed earlier this session |
| `TestimonialsSection.tsx`, `SuccessStoriesSection.tsx` (×2), `EventsSection.tsx`, `BlogEditor.tsx` (CMS admin) | Raw DB value, unresolved → `<img>` | 🔴 Broken (not just uncached — literally 404s, bare relative path) | Same fix pattern as the two above, unrelated to the Hero/Team bug class |
| `MediaLibrarySection.tsx` (×2) | Full Supabase URL from `getPublicUrl()` → `<img>` | 🟠 Needs migration | Loads, but never cached; admin-only traffic |

**Net new information vs. the prior audit:** the "needs migration" tier is much larger than previously flagged, because the standard itself changed. The prior audit accepted `next/image`-direct-to-Supabase as compliant; production data has now disproven that for the highest-traffic instances, and the same structural risk exists everywhere else `next/image` is fed a raw/resolved Supabase URL instead of the proxy URL.

---

## 4. Unified Image Component — `<AppImage />` (Design Only)

**Recommendation: introduce it, but as a thin wrapper, not a new abstraction layer.**

- **Responsibility:** exactly one job — always resolve `src` through `proxiedMediaUrl()` before handing it to either `next/image` or a plain `<img>`, so it becomes structurally impossible to reintroduce this bug class.
- **Public API:** mirrors `next/image`'s props (`src`, `alt`, `fill`, `sizes`, `priority`, `className`) plus one internal decision: if `fill`/`width`+`height` are given, render `next/image`; otherwise fall back to a plain proxied `<img>` (covers the aspect-ratio-driven cases that currently use raw `<img>`). Callers never see this branching.
- **Internals:** `const resolved = proxiedMediaUrl(src); return fill-or-sized ? <Image src={resolved} .../> : <img src={resolved} .../>`. No new caching logic — it's a call-site guarantee, not a new mechanism.
- **Benefit:** collapses today's two-pattern convention (which is exactly what let this bug happen twice — once in the portal, now again here) into one call site. Future code review only needs to check "did you use `<AppImage>`," not "did you remember to wrap it."
- **Migration strategy:** introduce alongside existing code (net-new file, zero risk). Migrate call sites in the same order as Section 6's roadmap — urgent fixes first (which naturally become the first `<AppImage>` adopters), then the rest mechanically, file by file, each swap independently testable/revertable (`git diff` is a one-line `src`/import change per call site).

---

## 5. Storage Metadata Normalization

**Current state (your measured data):** max-age observed at 60s, 3600s, 2678400s, 31536000s across different objects. Traced causes in code:
- New CMS uploads: `cacheControl: '86400'` (`src/app/api/cms/media/route.ts:143`) — 1 day.
- Original bulk migration (`scripts/migrate-media.ts:67`): no `cacheControl` option passed at all → falls through to the Storage SDK's own default, which is why some objects are stuck at a much shorter value.
- A prior backfill pass (`scripts/backfill-storage-cache-control.ts`) already exists and re-uploads every object with a configurable `NEW_CACHE_CONTROL` (currently set to `'86400'` in the file).

**Recommended target:** one value, everywhere — `max-age=31536000, immutable`. Under the Section 2 hybrid architecture this becomes a *safety net* rather than the primary mechanism (the proxy overrides it for anything routed through `/api/images`), but it still matters for the rollout window before every `<Image>` call site is migrated, and it's nearly free since the tooling already exists.

**Safe migration approach:**
1. Bump `NEW_CACHE_CONTROL` in `backfill-storage-cache-control.ts` from `'86400'` to `'31536000'`.
2. Run it with `--dry-run` first (flag already supported), review the file count, then run for real. It re-uploads bytes unchanged — content-safe, already has per-file `--file` targeting for a smoke test before the full-bucket run.
3. Bump the CMS upload route's `cacheControl: '86400'` (line 143) to `'31536000'` so new uploads don't drift back to the old inconsistency.
4. Leave `migrate-media.ts` as-is — it's a one-time historical script, not a recurring path; no need to touch it.

**Rollback:** the backfill script only changes Storage object metadata, not content — re-running it with a different `NEW_CACHE_CONTROL` value is itself the rollback, no data loss risk either direction.

---

## 6. Deployment & Infrastructure

- **`.vercel.app` exposure (proven finding):** the auto-generated alias is reachable independently of the custom domain and has no warm cache of its own — any request to it (crawler, headless browser, curl) is a guaranteed cold-cache burst against every image on whatever page is hit. **Fix: redirect any request whose `Host` header isn't the canonical domain to the canonical domain (308), enforced at the edge/middleware level — not via `robots.txt`,** since the actor here was a headless browser, not a robots.txt-respecting crawler. `src/proxy.ts` already exists as Next middleware but its `matcher` is currently scoped to `/cms/:path*` and `/api/cms/:path*` only — the host check needs to run for *all* paths, so this is either a matcher change to that file (with the host-check running before the Supabase auth call, to keep it cheap) or Vercel's own project-level domain redirect setting, if available — whichever is lower-risk operationally is fine; both achieve the same outcome.
- **Cache fragmentation risk:** the custom domain and the `.vercel.app` alias are two different cache keys at every layer (Vercel edge, browser). Until the redirect is in place, the "warm cache" you're building on the real domain provides zero protection against the alias being hit. This is why the redirect is a same-priority fix to the Hero/Team one, not a follow-up.
- **Firewall/access recommendation:** no need for full Vercel Deployment Protection (password/SSO) on production — that would block legitimate public traffic. The redirect achieves the goal (no independent cache surface) without adding auth friction.

---

## 7. Risk Analysis

| Change | Technical risk | User/SEO impact | Rollback |
|---|---|---|---|
| Hero.tsx / team page → `proxiedMediaUrl()` | Very low — identical pattern already proven twice this session (loyalty portal) | None — same visual output, just cached correctly | Single-commit revert |
| `.vercel.app` → canonical redirect | Low — must confirm it doesn't break Vercel's own preview-deployment workflows (preview URLs are a *different* hostname pattern than the production alias; verify before widening the middleware matcher) | Positive for SEO (removes a duplicate-content surface); neutral for real users, who already use the custom domain | Revert matcher/redirect config |
| Metadata normalization backfill | Low — script already exists, dry-run supported, content untouched | None — invisible to users | Re-run with old value |
| Full `<AppImage>` migration (Section 6 roadmap) | Low per-commit, mechanical | None if done as `src`-only swaps (no layout/dimension changes) | Per-file revert, independently |
| Removing Supabase `remotePatterns` entry (final step, deferred) | Medium if done before every call site is migrated — would break any missed direct-Supabase `<Image>` | Broken images if premature | Don't do until Section 3's table is 100% ✅ |

---

## 8. Performance & Cached-Egress Impact (Expected, Not Yet Measured)

- **Hero + Team fix:** removes the two highest-confirmed contributors to the 47MB/90s burst pattern — expected to be the single largest egress reduction in this plan, since these are homepage/team-page assets hit on nearly every session.
- **`.vercel.app` redirect:** eliminates a *second, independent* cold-cache surface entirely — every future bot/tool hit against the alias currently costs a full re-fetch of whatever it loads; after the redirect, it costs one 308 response and nothing else.
- **Metadata normalization:** raises the floor for every object not yet migrated to the proxy, reducing variance rather than chasing an average.
- **Full migration (Section 6):** converges every remaining direct-to-Supabase `<Image>` onto the same consistent, long-cached path already proven for the `<img>`/`proxiedMediaUrl()` half of the app.

No new measurement tooling is proposed here — `scripts/check-supabase-usage.ts` (already exists, per the prior audit) remains the right instrument to confirm the before/after delta once Commits 1–2 ship.

---

## 9. Commit-by-Commit Roadmap

### Ship today — independent of everything else below

**Commit 1 — "Route Hero + Team page images through the cache proxy"**
- *Files:* `src/components/home/Hero.tsx` (lines 212-219, 254), `src/app/(frontend)/team/page.tsx` (lines 82, 125)
- *Change:* wrap each `src` value in `proxiedMediaUrl()` instead of the raw string / `resolveMediaUrl()`. No import cycle risk — `media-url.ts` has no dependency on either file.
- *Difficulty:* Low. *Risk:* Low (identical pattern already shipped twice this session).
- *Validate:* load `/` and `/team` in prod, confirm `Cache-Control: public, max-age=31536000, immutable` on the image responses (devtools Network tab); re-run whatever measurement produced the original 47MB/90s figure.
- *Rollback:* single-commit revert.

**Commit 2 — "Redirect non-canonical (.vercel.app) requests to the production domain"**
- *Files:* `src/proxy.ts` (widen matcher + add host check) *or* Vercel project settings (domain redirect), whichever your infra prefers.
- *Difficulty:* Low-Medium (needs the preview-deployment caveat in Section 7 checked first). *Risk:* Low-Medium.
- *Validate:* hit the `.vercel.app` URL directly post-deploy, confirm 308 to the custom domain; confirm preview deployments (PR branches) still work if they're on a different hostname pattern.
- *Rollback:* revert matcher/redirect config.

### This week — mechanical migration, each independently deployable

**Commit 3 — "Normalize Storage object cache-control metadata"**
- *Files:* `scripts/backfill-storage-cache-control.ts` (bump constant), `src/app/api/cms/media/route.ts:143` (bump constant), then run the script.
- *Difficulty:* Low. *Risk:* Low. *Validate:* dry-run output, then spot-check a few objects' headers post-run. *Rollback:* re-run with prior value.

**Commit 4 — "Fix broken CMS admin image previews"**
- *Files:* the 7 unproxied `<img>` instances already identified (`TestimonialsSection.tsx`, `SuccessStoriesSection.tsx` ×2, `EventsSection.tsx`, `BlogEditor.tsx`, `MediaLibrarySection.tsx` ×2).
- *Difficulty:* Low. *Risk:* Low. *Validate:* open each CMS admin view, confirm images render. *Rollback:* per-file revert.

**Commit 5 — "Introduce `<AppImage />`"**
- *Files:* new file only (e.g. `src/components/shared/AppImage.tsx`). Not called anywhere yet.
- *Difficulty:* Low. *Risk:* None (dead code until adopted).

**Commit 6 — "Migrate static hero banners to `<AppImage />`"**
- *Files:* the ~15 `study-abroad/*`/`services/*`/`courses/*`/`about`/`blog`/`resources` hero images (Section 3, 🟠 tier).
- *Difficulty:* Low, mechanical, high file count. *Risk:* Low, one line per file.
- *Validate:* visual spot-check a sample of pages; no dimension/layout changes expected.

**Commit 7 — "Migrate locations pages to `<AppImage />`"**
- *Files:* `locations/[slug]/page.tsx`, `locations/page.tsx`.
- *Difficulty:* Low. *Risk:* Low.

**Commit 8 — "Remove Supabase hostname from next.config remotePatterns"**
- *Files:* `next.config.ts`.
- *Gate:* only after Section 3's table is 100% ✅ — this is the one commit that will visibly break something if done early.
- *Difficulty:* Low. *Risk:* Medium if sequenced wrong, Low if done last.
- *Validate:* full click-through of every page in Section 3 before merging.

---

## 10. Success Criteria

- Commits 1–2 shipped and confirmed via headers/re-test within the 8-day window — this is the number that actually needed to move.
- `check-usage` shows Cached Egress trending down (or at minimum, flat instead of climbing) within one billing cycle of Commits 1–3.
- Section 3's inventory reaches 100% ✅ by end of Commit 8, with the Supabase `remotePatterns` entry removed as the final confirmation that migration is complete — at that point every image in the app has exactly one way to be requested, cached, and re-requested.

---

**Stopping here per instruction.** Waiting on your call for which commits to execute now vs. defer — my default read is Commits 1 and 2 today, 3–4 this week, 5–8 as capacity allows before the grace period ends, but that's your sequencing call to make.
