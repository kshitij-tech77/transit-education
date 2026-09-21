import Link from "next/link";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { ArrowRight } from "lucide-react";
import Breadcrumb, { breadcrumbListNode, type BreadcrumbItem } from "@/components/shared/Breadcrumb";
import { JsonLd } from "@/components/shared/Schema";
import SectionLabel from "@/components/shared/SectionLabel";
import { INDEXABLE_ROBOTS, LOGO_URL, ORG_ID, SITE_NAME } from "@/lib/blog-seo";
import { latestDate } from "@/lib/blog-posts";
import { supabase } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/site-url";
import { DESTINATIONS, STUDY_ABROAD_PATH, SUBPAGE_LABELS, type CountrySubpage } from "@/lib/study-abroad";

const URL_PATH = STUDY_ABROAD_PATH;
const PAGE_URL = absoluteUrl(URL_PATH);
const HEADING = "Study Abroad from Nepal";
// Absolute title (no "| Transit Education" template) so the length is exact:
// 50 to 60 characters. seo-check asserts it.
const TITLE = `Study Abroad from Nepal: Destinations | ${SITE_NAME}`;
const DESCRIPTION =
  "Explore the study abroad destinations for students from Nepal. Open a country guide, its student visa and cost pages, or talk to our counsellors.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [{ url: LOGO_URL, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: [LOGO_URL],
  },
};

// Same `countries` tag and 5 minute window as the layout's nav query, so a
// CMS edit (Draft/Live, meta description) reaches this page like the nav.
const getCachedLiveCountries = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("countries")
      .select("id, name, meta_description, why_study, updated_at")
      .eq("status", "LIVE");
    if (error) throw error;
    return data ?? [];
  },
  ["study-abroad-hub-countries"],
  { revalidate: 300, tags: ["countries"] },
);

interface Card {
  id: string;
  name: string;
  description: string;
  subpages: CountrySubpage[];
}

/**
 * The destinations that have a page right now. Pages that read the CMS 404
 * unless the country is LIVE, so they are listed only when it is. A live
 * country with no hand-written page is served by /study-abroad/[slug], so it
 * is listed too. If the CMS read fails, the hand-written list is shown as is.
 */
async function loadCards(): Promise<{ cards: Card[]; lastModified: string | null }> {
  let rows: Awaited<ReturnType<typeof getCachedLiveCountries>> = [];
  let cmsOk = true;
  try {
    rows = await getCachedLiveCountries();
  } catch {
    cmsOk = false;
  }
  const live = new Map(rows.map((row) => [row.id, row]));

  const cards: Card[] = DESTINATIONS.filter((d) => !d.cms || !cmsOk || live.has(d.id)).map((d) => ({
    id: d.id,
    name: d.name,
    // Same precedence as the page's own metadata: the CMS description first.
    description: (d.cms && live.get(d.id)?.meta_description?.trim()) || d.description,
    subpages: d.subpages,
  }));

  const known = new Set(DESTINATIONS.map((d) => d.id));
  const extras = rows
    .filter((row) => !known.has(row.id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((row) => ({
      id: row.id,
      name: row.name,
      // No meta description: use the first paragraph of the hero copy, which
      // the country page renders as its intro (see /study-abroad/[slug]).
      description: row.meta_description?.trim() || row.why_study?.split(/\n\n+/)[0]?.trim() || "",
      subpages: [],
    }));

  return {
    cards: [...cards, ...extras],
    lastModified: latestDate(...rows.map((row) => row.updated_at)),
  };
}

// Wording below is each page's own hero copy (h1 paragraph), unchanged.
const HELP_LINKS = [
  {
    href: "/services/admission-counselling",
    title: "Admission Counselling",
    text: "From choosing the right match destination to picking the perfect institution for you. We guide you through every step of your application journey.",
  },
  {
    href: "/services/student-visa-service",
    title: "Student Visa Service",
    text: "Achieving your dream of studying abroad starts with a successful visa application. We provide clarity and right guidance throughout the complex process.",
  },
  {
    href: "/services/test-preparation",
    title: "Test Preparation",
    text: "We provide everything necessary for a student planning to study abroad including world-class preparation for IELTS, PTE, TOEFL, and SAT.",
  },
  {
    href: "/contact",
    title: "Contact Transit Education",
    text: "4 branches across Nepal. Pick yours and we'll connect you instantly.",
  },
];

// Titles and first sentences from the /tools page.
const TOOL_LINKS = [
  {
    href: "/tools/ielts-band-calculator",
    title: "IELTS Band Score Calculator",
    text: "Enter your Listening, Reading, Writing, and Speaking scores to calculate your overall IELTS band.",
  },
  {
    href: "/tools/gpa-converter",
    title: "GPA Converter (NEB/SLC to GPA)",
    text: "Convert your Nepal NEB percentage (Class 11/12) or Bachelor's percentage to the 4.0 GPA scale used by universities in Canada, USA, UK, and Australia.",
  },
];

export default async function StudyAbroadHubPage() {
  const { cards, lastModified } = await loadCards();

  const trail: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Study Abroad", href: URL_PATH },
  ];

  // One @graph. The Organization itself is emitted once by the root layout;
  // it is only referenced by @id here.
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: HEADING,
        description: DESCRIPTION,
        inLanguage: "en",
        ...(lastModified && { dateModified: lastModified }),
        publisher: { "@id": ORG_ID },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: cards.map((card, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: card.name,
            url: absoluteUrl(`${URL_PATH}/${card.id}`),
          })),
        },
      },
      breadcrumbListNode(trail, `${PAGE_URL}#breadcrumb`),
    ],
  };

  return (
    <div className="pt-20">
      <JsonLd data={graph} />

      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="container relative z-10">
          <Breadcrumb items={trail} />
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">Study Abroad</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              Study Abroad <span className="text-brand">from Nepal</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Choose a destination to open its country guide. Where a destination has student visa and cost pages, they are linked from its card.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-off-white">
        <div className="container">
          <SectionLabel>Destinations</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-12">Choose a destination</h2>
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <li
                key={card.id}
                className="flex flex-col bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-black mb-4 leading-tight">
                  <Link href={`${URL_PATH}/${card.id}`} className="group inline-flex items-center gap-2 hover:text-brand transition-colors">
                    {card.name}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </Link>
                </h3>
                {card.description && <p className="text-gray-600 text-sm leading-relaxed flex-1">{card.description}</p>}
                {card.subpages.length > 0 && (
                  <div className="mt-6 flex gap-3 flex-wrap">
                    {card.subpages.map((subpage) => (
                      <Link
                        key={subpage}
                        href={`${URL_PATH}/${card.id}/${subpage}`}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-brand/10 text-brand hover:bg-brand hover:text-white transition-colors"
                      >
                        {SUBPAGE_LABELS[subpage]}
                        <span className="sr-only"> for {card.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container">
          <SectionLabel>Our Services</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-12">How Transit Education helps</h2>
          <ul className="grid md:grid-cols-2 gap-8">
            {HELP_LINKS.map((item) => (
              <li key={item.href} className="flex flex-col bg-off-white border border-gray-100 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-bold text-black mb-4 leading-tight">
                  <Link href={item.href} className="group inline-flex items-center gap-2 hover:text-brand transition-colors">
                    {item.title}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-24 bg-off-white border-t border-gray-100">
        <div className="container">
          <SectionLabel>Tools</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-12">Free Tools for Nepali Students</h2>
          <ul className="grid md:grid-cols-2 gap-8">
            {TOOL_LINKS.map((tool) => (
              <li key={tool.href} className="flex flex-col bg-white border border-gray-100 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-bold text-black mb-4 leading-tight">
                  <Link href={tool.href} className="group inline-flex items-center gap-2 hover:text-brand transition-colors">
                    {tool.title}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{tool.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
