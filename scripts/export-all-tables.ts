/**
 * export-all-tables.ts
 *
 * One-off safety copy: dumps every row from every public-schema table (plus
 * auth.users) in the production Supabase project to local JSON + CSV files
 * under backups/<timestamp>/. Read-only — issues only SELECT/list calls via
 * the service-role key, never writes anything back to Supabase.
 *
 * backups/ is gitignored; nothing here gets committed.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *   npx tsx scripts/export-all-tables.ts
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from
 * .env.local, same as the rest of the app.
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TABLES = [
  "authors",
  "blog_posts",
  "branches",
  "countries",
  "events",
  "faqs",
  "franchise_inquiries",
  "heartbeat",
  "job_applications",
  "job_openings",
  "login_attempts",
  "loyalty_members",
  "loyalty_redemptions",
  "loyalty_rewards",
  "loyalty_transactions",
  "newsletter_subscribers",
  "otp_codes",
  "profiles",
  "resources",
  "site_settings",
  "students",
  "success_stories",
  "team_members",
  "testimonials",
];

const PAGE_SIZE = 1000;

async function fetchAllRows(table: string): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function fetchAllAuthUsers(): Promise<Record<string, unknown>[]> {
  const users: Record<string, unknown>[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });
    if (error) throw new Error(`auth.users: ${error.message}`);
    if (!data || data.users.length === 0) break;

    users.push(...(data.users as unknown as Record<string, unknown>[]));
    if (data.users.length < PAGE_SIZE) break;
    page += 1;
  }

  return users;
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => csvEscape(row[c])).join(","));
  }
  return lines.join("\n");
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.resolve(process.cwd(), "backups", stamp);
  fs.mkdirSync(outDir, { recursive: true });

  const summary: { name: string; rows: number; error?: string }[] = [];

  for (const table of TABLES) {
    try {
      const rows = await fetchAllRows(table);
      fs.writeFileSync(
        path.join(outDir, `${table}.json`),
        JSON.stringify(rows, null, 2)
      );
      fs.writeFileSync(path.join(outDir, `${table}.csv`), toCsv(rows));
      summary.push({ name: table, rows: rows.length });
      console.log(`✓ ${table}: ${rows.length} rows`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.push({ name: table, rows: 0, error: message });
      console.error(`✗ ${table}: ${message}`);
    }
  }

  try {
    const users = await fetchAllAuthUsers();
    fs.writeFileSync(
      path.join(outDir, "auth_users.json"),
      JSON.stringify(users, null, 2)
    );
    fs.writeFileSync(path.join(outDir, "auth_users.csv"), toCsv(users));
    summary.push({ name: "auth.users", rows: users.length });
    console.log(`✓ auth.users: ${users.length} rows`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    summary.push({ name: "auth.users", rows: 0, error: message });
    console.error(`✗ auth.users: ${message}`);
  }

  fs.writeFileSync(
    path.join(outDir, "_summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\nBackup written to ${outDir}`);
  const failed = summary.filter((s) => s.error);
  if (failed.length > 0) {
    console.error(`\n${failed.length} table(s) failed — see above.`);
    process.exit(1);
  }
}

main();
