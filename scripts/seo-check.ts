/**
 * seo-check.ts
 *
 * Crawls a running production build and asserts the SEO / AEO / GEO contract
 * for every published blog post, plus sitemap, robots, feeds and the 404 page.
 * It only reads: it never writes to Supabase or to the site.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *   npm run build && npm start        # in one terminal (port 3000)
 *   npm run seo-check                 # in another
 *
 *   BASE_URL   where the build is running (default http://localhost:3000)
 *              Use https://www.transiteducation.com.np to check production.
 *   SITE_URL   canonical origin the pages must advertise. Defaults to the same
 *              value the app uses (src/lib/site-url.ts), so set it to the same
 *              value you started the server with.
 *   SEO_CHECK_MIN_H2   minimum <h2> per post (default 3)
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (read from
 * .env.local) to list the published posts. Exit code is 1 if any check fails.
 */
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { SITE_URL } from "../src/lib/site-url";

loadEnv({ path: ".env.local", quiet: true });

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const SITE_ORIGIN = new URL(SITE_URL).origin;
const IS_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(BASE_URL);
const MIN_H2 = Number(process.env.SEO_CHECK_MIN_H2 ?? 3);
const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "OAI-SearchBot"];

interface PostRow {
  slug: string;
  body: string | null;
  noindex: boolean | null;
  canonical_url: string | null;
  faq_schema: { question?: string; answer?: string }[] | null;
}

let failures = 0;
let passes = 0;

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    passes++;
    console.log(`  ok    ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? `  (${detail})` : ""}`);
  }
}

/** Requests always hit BASE_URL, whatever host the URL was written with. */
const toLocal = (url: string) => BASE_URL + new URL(url).pathname + new URL(url).search;

async function get(url: string, redirect: RequestRedirect = "manual") {
  const res = await fetch(url, { redirect, headers: { "user-agent": "seo-check/1.0" } });
  return { status: res.status, headers: res.headers, text: await res.text() };
}

const stripScripts = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const toText = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function metaTags(html: string, name: string): string[] {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return tags.filter((tag) => new RegExp(`name=["']${name}["']`, "i").test(tag));
}

/** A run of plain words from the first substantial paragraph of the article. */
function bodySample(body: string): string | null {
  for (const match of body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const words = toText(match[1]).split(" ");
    const clean = words.filter((w) => /^[A-Za-z0-9,.'-]+$/.test(w));
    for (let i = 0; i + 8 <= words.length; i++) {
      const run = words.slice(i, i + 8);
      if (run.every((w) => clean.includes(w))) return run.join(" ");
    }
  }
  return null;
}

function jsonLdNodes(html: string): { nodes: Record<string, unknown>[]; problems: string[] } {
  const problems: string[] = [];
  const nodes: Record<string, unknown>[] = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    if (m[1].includes("<")) problems.push("unescaped < inside a JSON-LD block");
    try {
      const doc = JSON.parse(m[1]);
      const list = Array.isArray(doc["@graph"]) ? doc["@graph"] : [doc];
      nodes.push(...list);
    } catch {
      problems.push("a JSON-LD block does not parse");
    }
  }
  return { nodes, problems };
}

const typesOf = (nodes: Record<string, unknown>[]) =>
  nodes.flatMap((n) => (Array.isArray(n["@type"]) ? (n["@type"] as string[]) : [n["@type"] as string]));

function expectedCanonical(post: PostRow): string {
  const custom = post.canonical_url?.trim();
  if (custom) return custom.replace(/^https?:\/\/(?:www\.)?transiteducation\.com\.np(?=\/|$)/i, SITE_ORIGIN);
  return `${SITE_ORIGIN}/blog/${post.slug}`;
}

async function checkPost(post: PostRow, sitemap: Map<string, string | null>) {
  console.log(`\n/blog/${post.slug}`);
  const { status, text: html } = await get(`${BASE_URL}/blog/${post.slug}`);
  check("status 200", status === 200, `got ${status}`);
  if (status !== 200) return;

  const visible = stripScripts(html);
  const robots = metaTags(html, "robots");
  check("exactly one robots meta", robots.length === 1, `found ${robots.length}`);
  const noindex = /noindex/i.test(robots.join(" "));
  check(
    post.noindex ? "noindex (post is hidden from search)" : "no noindex",
    noindex === Boolean(post.noindex),
    robots.join(" ")
  );

  check("exactly one <h1>", (visible.match(/<h1\b/gi) ?? []).length === 1);
  const h2s = (visible.match(/<h2\b/gi) ?? []).length;
  check(`at least ${MIN_H2} <h2>`, h2s >= MIN_H2, `found ${h2s}`);

  const sample = bodySample(post.body ?? "");
  check(
    "article text is in the server HTML (outside <script>)",
    sample !== null && toText(visible).includes(sample),
    sample ? `missing "${sample}"` : "could not pick a sample sentence"
  );

  const canonical = /<link rel="canonical" href="([^"]+)"/i.exec(html)?.[1];
  check("canonical is SITE_URL + path", canonical === expectedCanonical(post), `got ${canonical}`);

  const { nodes, problems } = jsonLdNodes(html);
  check("JSON-LD parses and escapes <", problems.length === 0, problems.join("; "));
  const types = typesOf(nodes);
  check("JSON-LD has BlogPosting", types.includes("BlogPosting"));
  check("JSON-LD has BreadcrumbList", types.includes("BreadcrumbList"));

  const faqs = (post.faq_schema ?? []).filter((f) => f.question?.trim() && f.answer?.trim());
  if (faqs.length > 0) {
    check("JSON-LD has FAQPage", types.includes("FAQPage"));
    const text = toText(visible);
    const hidden = faqs.filter(
      (f) => !text.includes(toText(f.question!)) || !text.includes(toText(f.answer!).slice(0, 60))
    );
    check("every FAQ question and answer is visible in the server HTML", hidden.length === 0,
      `${hidden.length} missing`);
  } else {
    check("no FAQPage without FAQ items", !types.includes("FAQPage"));
  }

  if (!post.noindex) {
    const url = `${SITE_ORIGIN}/blog/${post.slug}`;
    check("listed in sitemap.xml", sitemap.has(url));
    check("sitemap entry has lastmod", Boolean(sitemap.get(url)));
  } else {
    check("hidden post is not in sitemap.xml", !sitemap.has(`${SITE_ORIGIN}/blog/${post.slug}`));
  }
}

async function checkSitemapUrls(sitemap: Map<string, string | null>) {
  console.log(`\nsitemap URLs (${sitemap.size})`);
  const urls = [...sitemap.keys()];
  const wrongHost = urls.filter((u) => new URL(u).origin !== SITE_ORIGIN);
  check(`every URL uses ${SITE_ORIGIN}`, wrongHost.length === 0, wrongHost.slice(0, 3).join(", "));

  const bad: string[] = [];
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let u = queue.shift(); u; u = queue.shift()) {
        const { status } = await get(toLocal(u));
        if (status !== 200) bad.push(`${u} -> ${status}`);
      }
    })
  );
  check("every URL returns 200", bad.length === 0, bad.slice(0, 5).join(", "));
}

async function main() {
  console.log(`seo-check  BASE_URL=${BASE_URL}  SITE_URL=${SITE_ORIGIN}`);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set");

  const { data, error } = await createClient(url, key)
    .from("blog_posts")
    .select("slug, body, noindex, canonical_url, faq_schema")
    .eq("status", "published");
  if (error) throw new Error(`could not list published posts: ${error.message}`);
  const posts = (data ?? []) as PostRow[];
  console.log(`${posts.length} published posts`);

  const sm = await get(`${BASE_URL}/sitemap.xml`);
  console.log("\nsitemap.xml");
  check("status 200", sm.status === 200, `got ${sm.status}`);
  const sitemap = new Map<string, string | null>();
  for (const m of sm.text.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1];
    if (loc) sitemap.set(decode(loc), /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1] ?? null);
  }
  check("has no changefreq / priority", !/<changefreq>|<priority>/.test(sm.text));

  for (const post of posts) await checkPost(post, sitemap);
  await checkSitemapUrls(sitemap);

  console.log("\nrobots.txt");
  const robots = await get(`${BASE_URL}/robots.txt`);
  check("status 200", robots.status === 200);
  check("Sitemap line points at the canonical sitemap", robots.text.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`));
  check("no Host line", !/^host:/im.test(robots.text));
  for (const path of ["/cms", "/admin", "/portal", "/api/", "/auth/"]) {
    check(`Disallow ${path}`, robots.text.includes(`Disallow: ${path}`));
  }
  const blocked = AI_CRAWLERS.filter((bot) => new RegExp(`user-agent:\\s*${bot}`, "i").test(robots.text));
  check("AI crawlers are not blocked", blocked.length === 0, blocked.join(", "));

  console.log("\nrss.xml and llms.txt");
  const rss = await get(`${BASE_URL}/rss.xml`);
  check("rss.xml returns 200 XML", rss.status === 200 && /<rss\b/.test(rss.text));
  const listed = posts.filter((p) => !p.noindex);
  check("rss.xml lists every indexable post",
    listed.every((p) => rss.text.includes(`${SITE_ORIGIN}/blog/${p.slug}`)));
  const llms = await get(`${BASE_URL}/llms.txt`);
  check("llms.txt returns 200", llms.status === 200);
  check("llms.txt lists the posts", listed.slice(0, 5).every((p) => llms.text.includes(`${SITE_ORIGIN}/blog/${p.slug}`)));
  check("llms.txt only uses the canonical host", !/https?:\/\/(?!www\.transiteducation\.com\.np)[^\s)]*transiteducation\.com\.np/.test(llms.text));

  console.log("\n404");
  const missing = await get(`${BASE_URL}/blog/does-not-exist-xyz`);
  check("status 404", missing.status === 404, `got ${missing.status}`);
  const missingRobots = metaTags(missing.text, "robots");
  check("exactly one robots meta, and it is noindex", missingRobots.length === 1 && /noindex/i.test(missingRobots[0]),
    missingRobots.join(" "));

  console.log("\nhost redirect");
  if (IS_LOCAL) {
    console.log("  skip  apex to www is a hosting setting; run with BASE_URL=" + SITE_ORIGIN + " to check it");
  } else {
    const apex = SITE_ORIGIN.replace("://www.", "://");
    const res = await get(`${apex}/blog`);
    const location = res.headers.get("location") ?? "";
    check("apex redirects permanently (301/308) to the canonical host",
      [301, 308].includes(res.status) && location.startsWith(SITE_ORIGIN), `${res.status} ${location}`);
  }

  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
