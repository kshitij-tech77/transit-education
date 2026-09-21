/**
 * check-legacy-redirects.ts
 *
 * Verifies the legacy WordPress redirect map (src/lib/legacy-redirects.ts)
 * against a running production build. For the slash AND no-slash form of every
 * source it asserts: exactly one hop, the expected status, the expected
 * Location, and that the destination answers 200 (or that a "gone" entry
 * answers 410 directly). It only reads: it never writes to the site.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *   npm run build && npm start        # in one terminal (port 3000)
 *   npm run check-legacy-redirects    # in another
 *
 *   BASE_URL   where the build is running (default http://localhost:3000)
 *              Use https://www.transiteducation.com.np to check production.
 *
 * Exit code is 1 if any check fails.
 */
import {
  LEGACY_PATTERN_RULES,
  LEGACY_SEARCH_REDIRECT,
  allExactEntries,
} from "../src/lib/legacy-redirects";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const REDIRECT_STATUSES = [301, 308];

interface Row {
  request: string;
  expect: string;
  got: string;
  ok: boolean;
  detail: string;
}

const rows: Row[] = [];
let failures = 0;

async function hit(path: string) {
  const res = await fetch(BASE_URL + path, {
    redirect: "manual",
    headers: { "user-agent": "check-legacy-redirects/1.0" },
  });
  await res.arrayBuffer();
  const location = res.headers.get("location");
  // Location may be absolute; only the path (and query) matters here.
  const target = location ? new URL(location, BASE_URL).pathname + new URL(location, BASE_URL).search : null;
  return { status: res.status, location: target };
}

function record(row: Row) {
  rows.push(row);
  if (!row.ok) failures++;
}

/** One request that must redirect once to `destination`, which must be 200. */
async function expectRedirect(path: string, destination: string) {
  const first = await hit(path);
  const problems: string[] = [];
  if (!REDIRECT_STATUSES.includes(first.status)) problems.push(`status ${first.status}`);
  if (first.location !== destination) problems.push(`Location ${first.location}`);

  // A second redirect at the destination would make this a chain.
  const dest = await hit(destination);
  if (dest.status !== 200) problems.push(`destination ${dest.status}`);

  record({
    request: path,
    expect: `${REDIRECT_STATUSES.join("/")} -> ${destination} -> 200`,
    got: `${first.status} -> ${first.location ?? "-"} -> ${dest.status}`,
    ok: problems.length === 0,
    detail: problems.join("; "),
  });
}

/** One request that must answer 410 directly (no hop). */
async function expectGone(path: string) {
  const res = await hit(path);
  record({
    request: path,
    expect: "410",
    got: String(res.status) + (res.location ? ` -> ${res.location}` : ""),
    ok: res.status === 410,
    detail: res.status === 410 ? "" : `status ${res.status}`,
  });
}

/** Data-file rules that need no server: no chains, loops or duplicates. */
function checkStructure() {
  const entries = allExactEntries();
  const sources = new Set<string>();
  const problems: string[] = [];

  for (const e of entries) {
    if (sources.has(e.source)) problems.push(`duplicate source ${e.source}`);
    sources.add(e.source);
    if (!e.source.startsWith("/") || e.source.length > 1 && e.source.endsWith("/")) {
      problems.push(`source must start with / and have no trailing slash: ${e.source}`);
    }
    if (e.status === "redirect" && !e.destination) problems.push(`no destination: ${e.source}`);
    if (e.status === "gone" && e.destination) problems.push(`gone entry has a destination: ${e.source}`);
  }
  const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);
  for (const e of entries) {
    if (!e.destination) continue;
    const dest = strip(e.destination.split("?")[0]);
    if (sources.has(dest)) problems.push(`destination is also a source (chain): ${e.source} -> ${dest}`);
    if (dest === strip(e.source)) problems.push(`loop: ${e.source}`);
    if (dest.startsWith("/index.php") || dest.startsWith("/wp-")) {
      problems.push(`destination is a legacy path: ${e.source} -> ${dest}`);
    }
  }
  record({
    request: "(data file)",
    expect: "no duplicates, chains or loops",
    got: problems.length === 0 ? "clean" : `${problems.length} problem(s)`,
    ok: problems.length === 0,
    detail: problems.join("; "),
  });
}

async function main() {
  console.log(`Checking legacy redirects against ${BASE_URL}\n`);
  checkStructure();

  for (const entry of allExactEntries()) {
    for (const path of [entry.source, `${entry.source}/`]) {
      if (entry.status === "gone") await expectGone(path);
      else await expectRedirect(path, entry.destination!);
    }
  }

  for (const rule of LEGACY_PATTERN_RULES) {
    for (const path of [rule.sample, `${rule.sample}/`]) {
      if (rule.status === "gone") await expectGone(path);
      else await expectRedirect(path, rule.sampleDestination ?? rule.destination!);
    }
  }

  // Old WordPress search: to the destination, query dropped.
  const search = await hit(`/?${LEGACY_SEARCH_REDIRECT.queryKey}=study+visa`);
  record({
    request: `/?${LEGACY_SEARCH_REDIRECT.queryKey}=study+visa`,
    expect: `308 -> ${LEGACY_SEARCH_REDIRECT.destination} (no query)`,
    got: `${search.status} -> ${search.location ?? "-"}`,
    ok: REDIRECT_STATUSES.includes(search.status) && search.location === LEGACY_SEARCH_REDIRECT.destination,
    detail: "",
  });

  // Regression guards: normal slash handling is unchanged, and there is no
  // catch-all (an unknown path must stay a real 404, not a soft 404 on "/").
  const slash = await hit("/about/");
  record({
    request: "/about/",
    expect: "308 -> /about",
    got: `${slash.status} -> ${slash.location ?? "-"}`,
    ok: REDIRECT_STATUSES.includes(slash.status) && slash.location === "/about",
    detail: "trailing slash normalisation changed",
  });
  // The destinations hub is a real page: it must answer 200 itself, and its
  // slash form must take exactly one 308 back to it (no loop, no chain).
  const hub = await hit("/study-abroad");
  record({
    request: "/study-abroad",
    expect: "200",
    got: `${hub.status}${hub.location ? ` -> ${hub.location}` : ""}`,
    ok: hub.status === 200,
    detail: "the destinations hub must not redirect",
  });
  await expectRedirect("/study-abroad/", "/study-abroad");
  const unknown = await hit("/definitely-not-a-real-page-xyz");
  record({
    request: "/definitely-not-a-real-page-xyz",
    expect: "404",
    got: String(unknown.status),
    ok: unknown.status === 404,
    detail: "unknown paths must 404, not redirect",
  });

  const width = (key: keyof Row) => Math.max(key.length, ...rows.map((r) => String(r[key]).length));
  const w = { request: width("request"), expect: width("expect"), got: width("got") };
  const line = (r: string, e: string, g: string, s: string) =>
    `${r.padEnd(w.request)}  ${e.padEnd(w.expect)}  ${g.padEnd(w.got)}  ${s}`;
  console.log(line("REQUEST", "EXPECTED", "GOT", "RESULT"));
  for (const r of rows) {
    console.log(line(r.request, r.expect, r.got, r.ok ? "ok" : `FAIL (${r.detail})`));
  }
  console.log(`\n${rows.length - failures} passed, ${failures} failed`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
