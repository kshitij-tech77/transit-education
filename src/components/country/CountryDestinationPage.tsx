import { GraduationCap, CheckCircle2, ListChecks, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FAQAccordion from "@/components/shared/FAQAccordion";
import SectionLabel from "@/components/shared/SectionLabel";
import Breadcrumb from "@/components/shared/Breadcrumb";
import Link from "next/link";
import { notFound } from "next/navigation";
import { proxiedMediaUrl } from "@/lib/media-url";

interface Props {
  countryId: string;
  heroImage: string;
  fallbacks?: {
    heroTitle?: string;
    whyStudy?: string;
    feature1Title?: string;
    feature1Desc?: string;
    feature2Title?: string;
    feature2Desc?: string;
  };
}

export default async function CountryDestinationPage({ countryId, heroImage, fallbacks = {} }: Props) {
  const [countryRes, faqsRes] = await Promise.all([
    supabase.from('countries').select('*').eq('id', countryId).single(),
    supabase
      .from('faqs')
      .select('*')
      .eq('page_path', `study-abroad/${countryId}`)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
  ]);

  const { data: country } = countryRes;
  let { data: faqsRaw } = faqsRes;

  if (!country) notFound();

  if (!faqsRaw || faqsRaw.length === 0) {
    const { data: globalFaqs } = await supabase
      .from('faqs')
      .select('*')
      .eq('page_path', 'Homepage')
      .eq('status', 'published')
      .limit(6);
    faqsRaw = globalFaqs;
  }

  const faqs = faqsRaw?.map(f => ({ ...f, featured: f.is_featured, status: 'Published' })) || [];

  const f1Title = country.feature1_title || fallbacks.feature1Title || 'Quality Education';
  const f1Desc  = country.feature1_desc  || fallbacks.feature1Desc  || 'World-class programs recognized globally.';
  const f2Title = country.feature2_title || fallbacks.feature2Title || 'Work & Career Path';
  const f2Desc  = country.feature2_desc  || fallbacks.feature2Desc  || 'Post-study work opportunities and career pathways.';
  const docs    = Array.isArray(country.required_documents) && country.required_documents.length > 0
    ? country.required_documents
    : ['Passport', 'Academic Transcripts', 'IELTS/PTE Score', 'Statement of Purpose (SOP)', 'Letters of Recommendation'];

  return (
    <main>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(f => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer }
              }))
            })
          }}
        />
      )}

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <img src={proxiedMediaUrl(heroImage)} alt={country.hero_title || countryId} className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10">
          <Breadcrumb items={[
            { label: "Home", href: "/" },
            { label: "Study Abroad", href: "/study-abroad" },
            { label: country.name || countryId },
          ]} />
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">Study Abroad</SectionLabel>
            <h1 className="text-5xl lg:text-7xl font-black mt-8 mb-6 leading-[0.9] tracking-tight">
              {country.hero_title || fallbacks.heroTitle || `Study in ${countryId}`}
            </h1>
            <div className="text-xl text-gray-300 leading-relaxed space-y-4">
              {(country.why_study || fallbacks.whyStudy || '')
                .split(/\n\n+/)
                .filter(Boolean)
                .map((para: string, i: number) => (
                  <p key={i}>{para.trim()}</p>
                ))}
            </div>
            {country.tagline && (
              <p className="mt-6 text-brand font-bold text-lg">{country.tagline}</p>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards + Intakes & Documents */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why {country.name}?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">
                {country.tagline || 'World-Class Education & Opportunities'}
              </h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">{f1Title}</h3>
                    <p className="text-gray-600 text-sm">{f1Desc}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">{f2Title}</h3>
                    <p className="text-gray-600 text-sm">{f2Desc}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {country.intakes || 'Contact Transit Education for current intake information.'}
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {docs.map((doc: string) => (
                  <li key={doc} className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" /> {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Entry Requirements */}
      {country.entry_requirements && (
        <section className="py-24 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <SectionLabel>Entry Requirements</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4">Eligibility for Nepali Students</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-brand/5 border border-brand/10">
                <h3 className="text-xl font-bold text-black mb-6">Undergraduate / Bachelors</h3>
                <ul className="space-y-4">
                  {(country.entry_requirements.ug || []).map((req: string, i: number) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                      <p>{req}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
                <h3 className="text-xl font-bold text-black mb-6">Masters / Postgraduate</h3>
                <ul className="space-y-4">
                  {(country.entry_requirements.pg || []).map((req: string, i: number) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                      <p>{req}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Visa Process */}
      {country.visa_process && country.visa_process.length > 0 && (
        <section className="py-24 bg-off-white">
          <div className="container max-w-4xl">
            <div className="text-center mb-16">
              <SectionLabel>Visa Process</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4">
                {country.visa_section_title || 'The Step-by-Step Journey'}
              </h2>
            </div>
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
              {country.visa_process.map((step: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-brand text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-black mb-1">Step {i + 1}: {step.title}</h4>
                    <p className="text-sm text-gray-600">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sub-page links */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {['visa', 'scholarships', 'cost', 'universities'].map(sub => (
              <Link
                key={sub}
                href={`/study-abroad/${countryId}/${sub}`}
                className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-brand hover:text-white hover:border-brand transition-all capitalize"
              >
                {sub === 'visa' ? 'Visa Guide' : sub === 'scholarships' ? 'Scholarships' : sub === 'cost' ? 'Cost of Living' : 'Universities'}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <SectionLabel>Questions?</SectionLabel>
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
