/**
 * Reads the hand-written content maps (VISA_CONTENT, SCHOLARSHIPS_CONTENT,
 * COST_CONTENT, UNIVERSITIES_CONTENT) out of the study-abroad sub-page source.
 *
 * Why parse instead of import: those constants live in a Next `page.tsx`,
 * which cannot export them, and importing a page module from a script pulls in
 * React/Next. Reading the literal straight from the source means ingestion
 * always sees exactly what the live pages render, with no copy to drift and
 * no change to the web app.
 *
 * The source is this repo's own code (not user input), so evaluating the
 * object literal is safe.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const SUBPAGE_SOURCE = 'src/app/(frontend)/study-abroad/[slug]/[subpage]/page.tsx';
export const COST_CALCULATOR_SOURCE = 'src/app/(frontend)/tools/cost-calculator/page.tsx';

/** Returns the source text of the object literal assigned to `const <name>`. */
export function extractConstLiteral(source: string, name: string): string {
  const declRe = new RegExp(`\\bconst\\s+${name}\\b`);
  const decl = declRe.exec(source);
  if (!decl) throw new Error(`const ${name} not found`);

  const eq = source.indexOf('= {', decl.index);
  if (eq === -1) throw new Error(`const ${name}: no object literal found`);
  const start = eq + 2;

  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '/' && source[i + 1] === '/') { i = source.indexOf('\n', i); if (i === -1) break; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`const ${name}: unbalanced braces`);
}

export function evaluateLiteral<T>(literal: string): T {
  return new Function(`"use strict"; return (${literal});`)() as T;
}

export function readConst<T>(source: string, name: string): T {
  return evaluateLiteral<T>(extractConstLiteral(source, name));
}

export function readRepoFile(relativePath: string, root = process.cwd()): string {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

// ── Shapes of the four maps (kept in sync with the page source) ─────────────
export interface VisaContent {
  title: string; intro: string;
  steps: { title: string; text: string }[]; docs: string[]; tips: string[];
}
export interface ScholarshipsContent {
  title: string; intro: string;
  scholarships: { name: string; amount: string; level: string; deadline: string; eligibility: string; notes: string }[];
}
export interface CostContent {
  title: string; currency: string; symbol: string; nprRate: number;
  cities: { name: string; items: [string, string][] }[]; totalNote: string; tips: string[];
}
export interface UniversitiesContent {
  title: string; intro: string;
  universities: { name: string; city: string; rank: string; programs: string; tuition: string }[];
}

export interface StaticGuides {
  visa: Record<string, VisaContent>;
  scholarships: Record<string, ScholarshipsContent>;
  cost: Record<string, CostContent>;
  universities: Record<string, UniversitiesContent>;
}

export function loadStaticGuides(root = process.cwd()): StaticGuides {
  const src = readRepoFile(SUBPAGE_SOURCE, root);
  return {
    visa: readConst(src, 'VISA_CONTENT'),
    scholarships: readConst(src, 'SCHOLARSHIPS_CONTENT'),
    cost: readConst(src, 'COST_CONTENT'),
    universities: readConst(src, 'UNIVERSITIES_CONTENT'),
  };
}
