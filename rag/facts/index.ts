/**
 * Structured facts: numbers are resolved by typed lookup, never by embeddings.
 *
 * A semantically similar chunk that happens to contain a number must never be
 * the source of a tuition or fee claim. Everything numeric the bot states
 * comes from here and is injected as the CANONICAL FACTS block.
 */
import { COST_DATA, NPR_RATES, type CostCountry, type CostData, type CostLevel } from './costs.data';
import { COUNTRY_SLUGS, type CountrySlug, type StudyLevel } from '../types';

export { COST_DATA, NPR_RATES };
export type { CostCountry, CostLevel, CostData };

export const COUNTRY_NAMES: Record<CountrySlug, string> = {
  canada: 'Canada',
  australia: 'Australia',
  uk: 'the UK',
  usa: 'the USA',
  germany: 'Germany',
  'new-zealand': 'New Zealand',
  ireland: 'Ireland',
  italy: 'Italy',
  'south-korea': 'South Korea',
};

/** Free-text aliases a student might type, longest match wins. */
const COUNTRY_ALIASES: [RegExp, CountrySlug][] = [
  [/\bnew\s*zealand\b|\bnz\b/i, 'new-zealand'],
  [/\bsouth\s*korea\b|\bkorea\b/i, 'south-korea'],
  [/\bunited\s*kingdom\b|\bu\.?k\.?\b|\bbritain\b|\bengland\b|\bscotland\b|\blondon\b/i, 'uk'],
  [/\bunited\s*states\b|\bu\.?s\.?a\b|\bamerica\b|\bf-?1\b/i, 'usa'],
  [/\bcanada\b|\bcanadian\b/i, 'canada'],
  [/\baustralia\b|\baustralian\b/i, 'australia'],
  [/\bgermany\b|\bgerman\b/i, 'germany'],
  [/\bireland\b|\birish\b/i, 'ireland'],
  [/\bitaly\b|\bitalian\b/i, 'italy'],
];

/** Every country slug mentioned in `text`, in order of first appearance. */
export function detectCountries(text: string): CountrySlug[] {
  const found: { slug: CountrySlug; at: number }[] = [];
  for (const [re, slug] of COUNTRY_ALIASES) {
    const m = re.exec(text);
    if (m && !found.some((f) => f.slug === slug)) found.push({ slug, at: m.index });
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.slug);
}

export function isCountrySlug(v: unknown): v is CountrySlug {
  return typeof v === 'string' && (COUNTRY_SLUGS as readonly string[]).includes(v);
}

export function hasCostData(country: string): country is CostCountry {
  return country in COST_DATA;
}

export function getCost(country: string, level: StudyLevel): CostData | null {
  return hasCostData(country) ? COST_DATA[country][level] : null;
}

export function toNpr(amount: number, currency: string): number {
  return Math.round(amount * (NPR_RATES[currency] ?? 0));
}

/** "NPR 21.6 lakh" style formatting (Nepali readers think in lakh / crore). */
export function formatNpr(npr: number): string {
  if (npr >= 10_000_000) return `NPR ${(npr / 10_000_000).toFixed(2).replace(/\.?0+$/, '')} crore`;
  if (npr >= 100_000) return `NPR ${(npr / 100_000).toFixed(1).replace(/\.0$/, '')} lakh`;
  return `NPR ${npr.toLocaleString('en-US')}`;
}

function money(c: CostData, amount: number): string {
  return `${c.currencySymbol}${amount.toLocaleString('en-US')}`;
}

/** First-year all-in range in the source currency: tuition + living + insurance + visa fee. */
export function firstYearRange(c: CostData): { min: number; max: number } {
  const fixed = c.healthInsurance + c.visaFee;
  return { min: c.tuitionMin + c.livingMin + fixed, max: c.tuitionMax + c.livingMax + fixed };
}

export const COST_SOURCE_LABEL = 'Transit Cost Calculator';

/** One canonical fact block for a country + level, rendered for the prompt. */
export function costFactLine(country: CostCountry, level: StudyLevel): string {
  const c = COST_DATA[country][level];
  const name = COUNTRY_NAMES[country];
  const y1 = firstYearRange(c);
  const npr = (a: number) => formatNpr(toNpr(a, c.currency));
  return [
    `- ${name}, ${level}: tuition ${money(c, c.tuitionMin)}–${money(c, c.tuitionMax)}/yr (${npr(c.tuitionMin)}–${npr(c.tuitionMax)}),`,
    `living ${money(c, c.livingMin)}–${money(c, c.livingMax)}/yr (${npr(c.livingMin)}–${npr(c.livingMax)}),`,
    `visa fee ${money(c, c.visaFee)}, health insurance ${money(c, c.healthInsurance)}/yr.`,
    `Estimated first-year total ${money(c, y1.min)}–${money(c, y1.max)} (${npr(y1.min)}–${npr(y1.max)}).`,
    `Rate used: 1 ${c.currency} = NPR ${NPR_RATES[c.currency]}. Source: ${COST_SOURCE_LABEL}.`,
  ].join(' ');
}

export interface AffordabilityRow {
  country: CostCountry;
  level: StudyLevel;
  minNpr: number;
  maxNpr: number;
  verdict: 'comfortable' | 'tight' | 'below_minimum';
}

/**
 * Which cost-calculator countries a NPR first-year budget covers.
 * comfortable: budget >= max estimate; tight: between min and max;
 * below_minimum: budget < min estimate.
 */
export function affordability(budgetNpr: number, level: StudyLevel): AffordabilityRow[] {
  const rows: AffordabilityRow[] = (Object.keys(COST_DATA) as CostCountry[]).map((country) => {
    const c = COST_DATA[country][level];
    const y = firstYearRange(c);
    const minNpr = toNpr(y.min, c.currency);
    const maxNpr = toNpr(y.max, c.currency);
    const verdict = budgetNpr >= maxNpr ? 'comfortable' : budgetNpr >= minNpr ? 'tight' : 'below_minimum';
    return { country, level, minNpr, maxNpr, verdict };
  });
  return rows.sort((a, b) => a.minNpr - b.minNpr);
}

export function affordabilityFactLines(budgetNpr: number, level: StudyLevel): string[] {
  const label = { comfortable: 'covers the whole range', tight: 'covers the low end only', below_minimum: 'is below the minimum' };
  return [
    `- Budget check for ${level} study, first-year total vs ${formatNpr(budgetNpr)} (Source: ${COST_SOURCE_LABEL}, estimates):`,
    ...affordability(budgetNpr, level).map(
      (r) => `  • ${COUNTRY_NAMES[r.country]}: ${formatNpr(r.minNpr)}–${formatNpr(r.maxNpr)}; the budget ${label[r.verdict]}.`,
    ),
  ];
}

export interface FactRequest {
  countries: string[];
  level?: StudyLevel | null;
  budgetNpr?: number | null;
  /** Wants cost/affordability facts (query understanding decides). */
  wantsCosts: boolean;
}

export interface ResolvedFacts {
  lines: string[];
  /** Names of the lookups that fired, logged to chat_messages.structured_used. */
  used: string[];
}

/**
 * Resolve the cost-side canonical facts for a turn. Country-level facts that
 * live in the DB (visa time, entry requirements) are added by
 * `retrieve/countryFacts.ts`, which needs a database round trip.
 */
export function resolveCostFacts(req: FactRequest): ResolvedFacts {
  const lines: string[] = [];
  const used: string[] = [];
  if (!req.wantsCosts) return { lines, used };

  const levels: StudyLevel[] = req.level ? [req.level] : ['bachelor', 'master'];
  const costCountries = req.countries.filter(hasCostData);

  for (const country of costCountries) {
    for (const level of levels) {
      lines.push(costFactLine(country, level));
      used.push(`cost:${country}:${level}`);
    }
  }
  if (req.budgetNpr && req.budgetNpr > 0) {
    const level = req.level ?? 'master';
    lines.push(...affordabilityFactLines(req.budgetNpr, level));
    used.push(`affordability:${level}`);
  }
  return { lines, used };
}
