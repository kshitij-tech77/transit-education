import type { BreadcrumbItem } from "@/components/shared/Breadcrumb";

export const STUDY_ABROAD_PATH = "/study-abroad";

export type CountrySubpage = "visa" | "cost";

export interface Destination {
  /** URL segment under /study-abroad and the `countries.id` in the CMS. */
  id: string;
  name: string;
  /**
   * The country page's own meta description (same string as its `metadata` or
   * `getCountryMetadata` fallback). Used when the CMS has no description for
   * the country, so a card reads the same as the page's search snippet.
   */
  description: string;
  /** True when the page reads the `countries` table and 404s unless LIVE. */
  cms: boolean;
  /** Sub-pages that have real content. Do not add one that says "coming soon". */
  subpages: CountrySubpage[];
}

export const SUBPAGE_LABELS: Record<CountrySubpage, string> = {
  visa: "Student Visa Guide",
  cost: "Cost of Studying",
};

/** Every country page that is hand-written in the codebase. */
export const DESTINATIONS: Destination[] = [
  {
    id: "canada",
    name: "Canada",
    description: "Complete guide to studying in Canada from Nepal. Canada Study Permit, SDS vs non-SDS, PGWP work rights, and pathway to Canadian Permanent Residency for Nepali students.",
    cms: true,
    subpages: ["visa", "cost"],
  },
  {
    id: "australia",
    name: "Australia",
    description: "Complete guide to studying in Australia from Nepal. Student Visa Subclass 500, GTE statement, OSHC, IELTS requirements, tuition fees, and scholarship options for Nepali students.",
    cms: true,
    subpages: ["visa", "cost"],
  },
  {
    id: "uk",
    name: "UK",
    description: "Complete guide to studying in the UK from Nepal. UK Student visa (Student Route), CAS number, TB test, IHS surcharge, Chevening scholarship, and Graduate Route visa for Nepali students.",
    cms: true,
    subpages: ["visa", "cost"],
  },
  {
    id: "usa",
    name: "USA",
    description: "Complete guide to studying in the USA from Nepal. F-1 student visa process, SEVIS fee, DS-160, OPT work rights, and Fulbright scholarship information for Nepali students.",
    cms: true,
    subpages: ["visa", "cost"],
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    description: "Complete guide to studying in New Zealand from Nepal. NZ student visa, 20-hour work rights, post-study work visa, and top New Zealand universities for Nepali students.",
    cms: false,
    subpages: [],
  },
  {
    id: "germany",
    name: "Germany",
    description: "Complete guide to studying in Germany from Nepal. Free public university education, APS certificate process, blocked account (Sperrkonto), DAAD scholarships, and National D Visa guidance.",
    cms: true,
    subpages: [],
  },
  {
    id: "south-korea",
    name: "South Korea",
    description: "Complete guide to studying in South Korea from Nepal. D-2 student visa, Alien Registration Card, GKS scholarship, TOPIK requirements, and top Korean universities for Nepali students.",
    cms: false,
    subpages: [],
  },
  {
    id: "ireland",
    name: "Ireland",
    description: "Complete guide to studying in Ireland from Nepal. Stamp 2 student visa, IRP registration, 20-hour work limit, GNIB, and top Irish universities for Nepali students.",
    cms: false,
    subpages: [],
  },
  {
    id: "italy",
    name: "Italy",
    description: "Complete guide to studying in Italy from Nepal. Italy student visa (Type D), DSU scholarships, Italian language requirements, and top universities for Nepali students.",
    cms: false,
    subpages: [],
  },
];

/**
 * The breadcrumb trail for a country page or one of its sub-pages:
 * Home > Study Abroad > Country (> Sub-page). Every item carries an href so
 * the BreadcrumbList JSON-LD can name its URL; the UI renders the last item
 * as the current page, not a link.
 */
export function countryBreadcrumbs(
  id: string,
  name: string,
  subpage?: { path: string; label: string },
): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Study Abroad", href: STUDY_ABROAD_PATH },
    { label: name, href: `${STUDY_ABROAD_PATH}/${id}` },
    ...(subpage ? [{ label: subpage.label, href: `${STUDY_ABROAD_PATH}/${id}/${subpage.path}` }] : []),
  ];
}

export interface Guide {
  /** Blog post slug, served at /blog/{slug}. */
  slug: string;
  /** Anchor text: the post's own headline. */
  title: string;
}

/** Blog guides linked from country pages, visa and cost pages, the visa service page and the hub. */
export const GUIDES: Guide[] = [
  {
    slug: "study-abroad-proof-of-funds-vs-real-cost-nepal",
    title: "How Much Money Do You Need to Study Abroad from Nepal? Proof of Funds vs Real Cost (2026)",
  },
  {
    slug: "study-abroad-intake-timeline-nepal",
    title: "Which Study Abroad Intake Should You Choose? A Backward Timeline for Nepali Students",
  },
];
