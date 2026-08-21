import { notFound } from "next/navigation";
import { DestinationHero } from "@/components/destinations/DestinationContent";
import SectionLabel from "@/components/shared/SectionLabel";
import { GraduationCap, CheckCircle2, ListChecks, HelpCircle, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FAQAccordion from "@/components/shared/FAQAccordion";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";

// `slug` is passed as an argument, so each country gets its own cache entry,
// revalidated every 5 minutes. Uses the anon client (not the cookie-aware
// server client) since `unstable_cache` can't access request-time APIs like
// cookies, and these are public, unauthenticated reads either way.
// The URL segment is the country's `id` (the slug the CMS derives from the
// name, e.g. "germany") — not `code` (the 2-letter field, e.g. "DE"). Every
// other place that resolves a country by URL (the countries API, the
// POST-create route, CountryDestinationPage, FaqSection's page paths) treats
// it as `id`; this used to be the only place using the wrong column, which
// made any CMS-created country (without a static override page) permanently
// unreachable here regardless of status.
const getCachedCountryBySlug = unstable_cache(
  async (slug: string) => {
    const res = await supabase
      .from('countries')
      .select('*')
      .eq('id', slug)
      .eq('status', 'LIVE')
      .single();
    return { data: res.data };
  },
  ['study-abroad-country'],
  { revalidate: 300, tags: ['countries'] }
);

const getCachedCountryFaqs = unstable_cache(
  async (slug: string) => {
    const res = await supabase
      .from('faqs')
      .select('*')
      .eq('page_path', `study-abroad/${slug}`)
      .eq('status', 'published')
      .order('display_order', { ascending: true });
    return { data: res.data };
  },
  ['study-abroad-country-faqs'],
  { revalidate: 300, tags: ['faqs'] }
);

const getCachedGlobalFaqsFallback = unstable_cache(
  async () => {
    const res = await supabase
      .from('faqs')
      .select('*')
      .eq('page_path', 'Homepage')
      .eq('status', 'published')
      .limit(6);
    return { data: res.data };
  },
  ['study-abroad-global-faqs-fallback'],
  { revalidate: 300, tags: ['faqs'] }
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: country } = await getCachedCountryBySlug(slug);

  if (!country) return {};

  const title = country.meta_title || `Study in ${country.name} | Transit Education`;
  const description = country.meta_description || `Everything you need to know about studying in ${country.name}. Visa requirements, tuition, and intakes.`;
  const image = "https://transiteducation.com.np/logo.png";

  return {
    title,
    description,
    alternates: { canonical: `https://transiteducation.com.np/study-abroad/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://transiteducation.com.np/study-abroad/${slug}`,
      images: [{ url: image, width: 1200, height: 630, alt: `Study in ${country.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    }
  };
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try fetching page-specific FAQs first
  let { data: faqsRaw } = await getCachedCountryFaqs(slug);

  // Fallback to Global FAQs if none for this specific country
  if (!faqsRaw || faqsRaw.length === 0) {
    const { data: globalFaqs } = await getCachedGlobalFaqsFallback();
    faqsRaw = globalFaqs;
  }

  const { data: country } = await getCachedCountryBySlug(slug);

  if (!country) {
    notFound();
  }

  // Fetch FAQs for this page
  const faqs = faqsRaw?.map(f => ({
    ...f,
    featured: f.is_featured,
    status: 'Published'
  })) || [];

  // Transform country for compatibility
  const formattedCountry = {
    ...country,
    heroTitle: country.hero_title,
    whyStudy: country.why_study,
    visaTime: country.visa_time,
    tuition: country.tuition_range,
    universities: country.top_universities?.join(', ')
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://transiteducation.com.np" },
      { "@type": "ListItem", position: 2, name: "Study Abroad", item: "https://transiteducation.com.np/study-abroad" },
      { "@type": "ListItem", position: 3, name: `Study in ${country.name}`, item: `https://transiteducation.com.np/study-abroad/${slug}` },
    ],
  };

  // FAQ Schema
  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f: any) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <DestinationHero
        title={formattedCountry.heroTitle || `Study in ${formattedCountry.name}`}
        subtitle="Study Abroad"
        description={formattedCountry.whyStudy || `Comprehensive guide to studying in ${formattedCountry.name}.`}
        image="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Web-banner-Canada.png"
      />

      <section className="py-24 bg-[#F7F3F3]">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why {formattedCountry.name}?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">Quality Education & Global Recognition</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-[#A93226] shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Academic Excellence</h3>
                    <p className="text-gray-600 text-sm">Institutions in {formattedCountry.name} are known for their high standards and research contributions.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-[#A93226] shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Global Career Path</h3>
                    <p className="text-gray-600 text-sm">Degrees from {formattedCountry.name} are recognized worldwide by employers and academic institutions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-[#A93226]" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {formattedCountry.major_intakes_description || formattedCountry.intakes || "Varies by institution. Contact us for details."}
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {(formattedCountry.required_documents?.length > 0 ? formattedCountry.required_documents : ["Passport Copy", "Academic Transcripts", "IELTS/PTE Score", "Statement of Purpose"]).map((doc: string) => (
                  <li key={doc} className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle2 className="w-4 h-4 text-[#A93226]" /> {doc}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ENTRY REQUIREMENTS */}
      {formattedCountry.entry_requirements && (
        <section className="py-24 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <SectionLabel>Entry Requirements</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4">Eligibility for Nepali Students</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-[#A93226]/5 border border-[#A93226]/10 h-full">
                <h3 className="text-xl font-bold text-black mb-6">Undergraduate / Bachelors</h3>
                <ul className="space-y-4">
                  {(formattedCountry.entry_requirements.ug || ["Completed Grade 12 with good standing", "IELTS 6.0 or equivalent"]).map((req: string, i: number) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-[#A93226] text-white flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</div>
                      <p>{req}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 rounded-3xl bg-black/5 border border-black/10 h-full">
                <h3 className="text-xl font-bold text-black mb-6">Masters / Postgraduate</h3>
                <ul className="space-y-4">
                  {(formattedCountry.entry_requirements.pg || ["Bachelors degree from recognized university", "IELTS 6.5 or equivalent"]).map((req: string, i: number) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</div>
                      <p>{req}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VISA PROCESS */}
      {formattedCountry.visa_process?.length > 0 && (
        <section className="py-24 bg-[#F7F3F3]">
          <div className="container max-w-4xl">
            <div className="text-center mb-16">
              <SectionLabel>Visa Process</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4">The Step-by-Step Journey</h2>
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-300 before:to-transparent">
              {formattedCountry.visa_process.map((step: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#A93226] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-black mb-1">Step {i+1}: {step.title}</h4>
                    <p className="text-sm text-gray-600">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      {faqs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <SectionLabel>Your Questions Answered</SectionLabel>
                <h2 className="text-4xl font-bold text-black mt-4">Frequently Asked Questions</h2>
              </div>
              <FAQAccordion items={faqs} />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
