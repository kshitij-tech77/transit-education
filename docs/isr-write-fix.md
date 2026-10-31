# Homepage ISR write reduction

## Scope

The reported Vercel dashboard attributes all ISR writes to this project and
roughly 62% of the observed 12-hour window to homepage HTML/prefetch artifacts.
This change reduces the homepage payload and removes query-order ambiguity;
it does not establish that ordering was the source of every changed render.

- Add unique ID tie-breakers to all homepage list queries and stable ordering
  to shared navigation/branch queries.
- Produce short blog cards inside the cached callback. Full article bodies and
  unrelated row fields no longer enter that cache result or client props. The
  excerpt transformation and displayed metadata retain their previous behavior.
- Throw on failed homepage/shared cached queries so a failed refresh does not
  replace good cached content with empty query results.
- Invalidate matching tags and the homepage after successful CMS mutations for
  FAQs, team, testimonials, success stories, settings, countries, branches, and
  events. Existing blog hooks remain in place. The separate, unmerged generic
  country/FAQ text PATCH endpoint is outside this release. Reads, rejected writes, and unrelated lead/loyalty writes do
  not invalidate the homepage.

The five-minute route/data TTLs remain intentional. Upcoming events expire with
the clock without a CMS save. Increasing the route TTL alone would also be
ineffective while lower-lived cached dependencies remain. An hourly policy
needs a separate event-expiry design and a freshness policy for out-of-band DB
edits; this change does not promise a 12-fold write reduction.

## Release checks

No automated tests or production builds were run, preserving the earlier task
restriction. Static validation: TypeScript (`tsc --noEmit --incremental false`),
targeted ESLint, and `git diff --check`. Existing lint findings must be separated
from any newly introduced findings.

Before production release, use a preview deployment once builds/deployment are
authorized:

1. Compare homepage card titles, author/date fallbacks, images, URLs, and 120
   character excerpts with the existing site. Check navigation and branch order.
2. Inspect HTML and RSC/prefetch responses: full blog bodies and unused blog row
   fields must not appear as card props. Do not treat raw response size as billed
   compressed ISR units.
3. On preview content, edit each affected CMS content type and verify the next
   new homepage request sees the edit. Check delete, Draft/Live, visibility, and
   creation paths. Confirm failed/unauthorized
   requests leave caches alone. Avoid making test content changes in production.
4. Verify an event disappears after its timestamp under the existing five-minute
   stale-while-revalidate policy. Confirm sitemap updates after country/branch
   changes and existing blog invalidation still works.
5. Compare HTML and prefetch artifacts across a normal revalidation boundary
   with unchanged content; record remaining differences. Avoid cache-busting
   URL variants or broad crawl/load tests.
6. After release, compare homepage write units and project daily ISR writes over
   comparable 12-hour windows and several days. Data Cache writes are a separate
   metric. Do not extrapolate a guaranteed monthly saving from payload changes.

This release branch starts from main and excludes the separate CMS
compare-and-set commit, unrelated local package changes, and the untracked
`rag/` directory. Nothing in this fix requires new
dependencies, schema migrations, or environment variables.

Rollback: revert the homepage/layout/card, public-content invalidation helper,
and its CMS handler call sites together. The new blog-card cache key prevents
old full-row cache values from being consumed as the new card shape.
