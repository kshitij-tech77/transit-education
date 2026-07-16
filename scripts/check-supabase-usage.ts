/**
 * check-supabase-usage.ts
 *
 * Usage tripwire: checks this Supabase project's current billing-cycle
 * usage against free-tier quotas (Egress, Cached Egress, Database Size)
 * and warns loudly if any metric is at or above 70% of quota.
 *
 * This does NOT modify anything — it only reads usage data via the
 * Supabase Management API. It is not scheduled or wired into CI; run it
 * manually (or wire it up later) as you decide.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *   npm run check-usage
 *
 * ── REQUIRED ENV VARS (add to .env.local — do NOT commit real values) ─────
 *   SUPABASE_ACCESS_TOKEN
 *     A Management API personal access token (NOT the anon/service-role
 *     keys used by the app itself — this is a separate credential scoped to
 *     your Supabase *account*, not a project). Create one at:
 *     https://supabase.com/dashboard/account/tokens
 *
 *   SUPABASE_PROJECT_REF
 *     Your project ref — the subdomain in NEXT_PUBLIC_SUPABASE_URL, e.g.
 *     for "https://vlrhwdcqzpfqpbqeaqyr.supabase.co" it's
 *     "vlrhwdcqzpfqpbqeaqyr". Kept as its own env var (rather than deriving
 *     it from NEXT_PUBLIC_SUPABASE_URL) so this script has no dependency on
 *     the rest of the app's env config.
 *
 * ── IMPORTANT CAVEAT — VERIFY ON FIRST RUN ─────────────────────────────────
 * Supabase tracks quota usage (egress, cached egress, database size) at the
 * ORGANIZATION level — summed across every project in that org — not
 * strictly per-project. This script resolves your project's parent
 * organization, then reads that organization's usage.
 *
 * The exact Management API response shape for the usage endpoint could not
 * be confirmed against live documentation while writing this script. To
 * avoid silently reporting wrong numbers, the parser below:
 *   1. Tries several plausible field-name variants per metric (see
 *      METRIC_FIELD_CANDIDATES), and
 *   2. Prints the full raw API response and exits non-zero if it can't
 *      confidently find a metric, instead of guessing.
 *
 * If step 2 happens on your first run, look at the printed raw response and
 * add the correct field name(s) to METRIC_FIELD_CANDIDATES below.
 */

import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const MANAGEMENT_API_BASE = "https://api.supabase.com/v1";

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

// Free-tier quotas as of 2026 (see https://supabase.com/pricing). Used only
// as a FALLBACK when the API response doesn't include its own quota/limit
// field for a metric — if the API does report a limit, that value wins.
const FALLBACK_QUOTA_GB = {
  egress: 5,
  cachedEgress: 5,
  dbSizeGb: 0.5,
} as const;

// Warn once usage reaches this fraction of quota.
const WARNING_THRESHOLD = 0.7;

type MetricKey = "egress" | "cachedEgress" | "dbSizeGb";

// Plausible field-name variants for each metric in the usage API response.
// Checked in order; first match wins. Extend this list if your first run
// prints a raw response with different field names.
const METRIC_FIELD_CANDIDATES: Record<MetricKey, string[]> = {
  egress: ["egress", "egress_bytes", "bandwidth", "db_egress", "total_egress"],
  cachedEgress: ["cached_egress", "cachedEgress", "cached_egress_bytes", "storage_cached_egress"],
  dbSizeGb: ["db_size", "database_size", "db_size_bytes", "database_size_bytes"],
};

const METRIC_LABELS: Record<MetricKey, string> = {
  egress: "Egress",
  cachedEgress: "Cached Egress",
  dbSizeGb: "Database Size",
};

interface ManagementApiProject {
  id: string;
  organization_id?: string;
  organization_slug?: string;
}

function fail(message: string): never {
  console.error(`\n[check-supabase-usage] ERROR: ${message}\n`);
  process.exit(2);
}

async function managementApiFetch(pathSegment: string): Promise<unknown> {
  const res = await fetch(`${MANAGEMENT_API_BASE}${pathSegment}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    fail(
      `${pathSegment} → HTTP ${res.status} ${res.statusText}\n` +
        `Response body:\n${body.slice(0, 1000)}`
    );
  }

  return res.json();
}

/**
 * Finds a numeric value in `obj` by trying each candidate key. Also checks
 * one level of nesting (e.g. { egress: { usage: N, quota: M } }), which is
 * a common shape for usage APIs that report both usage and a limit
 * together. Returns both the usage number and, if present, an accompanying
 * quota/limit number.
 */
function extractMetric(
  obj: Record<string, unknown>,
  candidates: string[]
): { usage: number | null; quota: number | null } {
  for (const key of candidates) {
    const val = obj[key];
    if (typeof val === "number") {
      return { usage: val, quota: null };
    }
    if (val && typeof val === "object") {
      const nested = val as Record<string, unknown>;
      const usage = nested.usage ?? nested.used ?? nested.value ?? nested.total;
      const quota = nested.quota ?? nested.limit ?? nested.cap;
      if (typeof usage === "number") {
        return {
          usage,
          quota: typeof quota === "number" ? quota : null,
        };
      }
    }
  }
  return { usage: null, quota: null };
}

/** Normalizes a raw usage number to GB. Bytes-scale values (>1000) are
 * assumed to be bytes; anything smaller is assumed to already be GB. */
function toGb(raw: number): number {
  return raw > 1000 ? raw / 1e9 : raw;
}

async function main() {
  if (!ACCESS_TOKEN || !PROJECT_REF) {
    fail(
      "Missing required env vars. Add these to .env.local:\n" +
        "  SUPABASE_ACCESS_TOKEN=<personal access token from https://supabase.com/dashboard/account/tokens>\n" +
        "  SUPABASE_PROJECT_REF=<your project ref, e.g. vlrhwdcqzpfqpbqeaqyr>"
    );
  }

  console.log(`[check-supabase-usage] Resolving organization for project ${PROJECT_REF}...`);
  const project = (await managementApiFetch(`/projects/${PROJECT_REF}`)) as ManagementApiProject;
  const orgIdentifier = project.organization_id ?? project.organization_slug;
  if (!orgIdentifier) {
    fail(
      `Couldn't find an organization_id/organization_slug field on the project response.\n` +
        `Raw response:\n${JSON.stringify(project, null, 2)}`
    );
  }

  console.log(`[check-supabase-usage] Fetching usage for organization ${orgIdentifier}...`);
  const usageRaw = await managementApiFetch(`/organizations/${orgIdentifier}/usage`);

  if (typeof usageRaw !== "object" || usageRaw === null) {
    fail(`Usage endpoint returned a non-object response:\n${JSON.stringify(usageRaw)}`);
  }
  const usage = usageRaw as Record<string, unknown>;

  const results: {
    key: MetricKey;
    usageGb: number;
    quotaGb: number;
    quotaSource: "api" | "fallback";
    percent: number;
  }[] = [];

  for (const key of Object.keys(METRIC_FIELD_CANDIDATES) as MetricKey[]) {
    const { usage: rawUsage, quota: rawQuota } = extractMetric(usage, METRIC_FIELD_CANDIDATES[key]);

    if (rawUsage === null) {
      fail(
        `Couldn't find a value for "${METRIC_LABELS[key]}" using known field names ` +
          `(${METRIC_FIELD_CANDIDATES[key].join(", ")}).\n` +
          `Add the correct field name to METRIC_FIELD_CANDIDATES in this script.\n\n` +
          `Raw usage response:\n${JSON.stringify(usage, null, 2)}`
      );
    }

    const usageGb = toGb(rawUsage);
    const quotaGb = rawQuota !== null ? toGb(rawQuota) : FALLBACK_QUOTA_GB[key];
    const quotaSource: "api" | "fallback" = rawQuota !== null ? "api" : "fallback";

    results.push({
      key,
      usageGb,
      quotaGb,
      quotaSource,
      percent: quotaGb > 0 ? usageGb / quotaGb : 0,
    });
  }

  console.log("\nSupabase usage this billing cycle:");
  console.log("─".repeat(72));
  for (const r of results) {
    const pct = (r.percent * 100).toFixed(1);
    const quotaNote = r.quotaSource === "fallback" ? " (fallback default — API didn't report a quota)" : "";
    console.log(
      `  ${METRIC_LABELS[r.key].padEnd(16)} ${r.usageGb.toFixed(3)} GB / ${r.quotaGb} GB  (${pct}%)${quotaNote}`
    );
  }
  console.log("─".repeat(72));

  const breaches = results.filter(r => r.percent >= WARNING_THRESHOLD);

  if (breaches.length > 0) {
    console.warn(`\n⚠️  WARNING: ${breaches.length} metric(s) at or above ${WARNING_THRESHOLD * 100}% of quota:\n`);
    for (const r of breaches) {
      console.warn(
        `   • ${METRIC_LABELS[r.key]}: ${r.usageGb.toFixed(3)} GB of ${r.quotaGb} GB used (${(r.percent * 100).toFixed(1)}%)`
      );
    }
    console.warn("");
    process.exit(1);
  }

  console.log(`\n✅ All metrics below ${WARNING_THRESHOLD * 100}% of quota.\n`);
  process.exit(0);
}

main().catch(err => {
  fail(err instanceof Error ? `${err.message}\n${err.stack}` : String(err));
});
