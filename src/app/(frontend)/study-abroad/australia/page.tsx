import { GraduationCap, CheckCircle2, ListChecks, HelpCircle, Plane, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FAQAccordion from "@/components/shared/FAQAccordion";
import SectionLabel from "@/components/shared/SectionLabel";
import { notFound } from "next/navigation";

export default async function AustraliaPage() {
  const [countryRes, faqsRes] = await Promise.all([
    supabase
      .from('countries')
      .select('*')
      .eq('id', 'australia')
      .single(),
    supabase
      .from('faqs')
      .select('*')
      .eq('page_path', 'study-abroad/australia')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
  ]);

  const { data: country } = countryRes;
  let { data: faqsRaw } = faqsRes;

  if (!country) notFound();

  // Fallback to Global FAQs if none for Australia
  if (!faqsRaw || faqsRaw.length === 0) {
    const { data: globalFaqs } = await supabase
      .from('faqs')
      .select('*')
      .eq('page_path', 'Homepage')
      .eq('status', 'published')
      .limit(6);
    faqsRaw = globalFaqs;
  }

  const faqs = faqsRaw?.map(f => ({
    ...f,
    featured: f.is_featured,
    status: 'Published'
  })) || [];

  return (
    <main>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.answer
                }
              }))
            })
          }}
        />
      )}
      <DestinationHero 
        title={country.hero_title || "Study in Australia"}
        subtitle="Study Abroad"
        description={country.why_study || "Australia is home to nearly 700,000 international students. It is the third most preferred destination due to its excellent education system and safe environment."}
        image="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Wwb-banner-Australia.png"
      />

      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why Australia?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">World-Class Degrees & Student Rights</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">22,000+ Courses</h3>
                    <p className="text-gray-600 text-sm">Australia offers a wide range of study programs across 1,100 institutions, with 6 universities in the world's top 100.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Student Protection</h3>
                    <p className="text-gray-600 text-sm">Student rights are protected through the ESOS Act 2000, TPS, and CRICOS registration.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {country.intakes || "Australia usually has two major intakes: February and July. Some universities and colleges also offer intakes in September and November."}
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {["Updated Resume", "Statement of Purpose (SOP)", "All Academic Certificates", "Passport Copy", "IELTS / PTE Score Sheet"].map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand" /> {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Sections from DB */}
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
                  {(country.entry_requirements.ug || ["At least B in High School Certificate or 12 years of schooling.", "IELTS - Each band 6.0 for Bachelor / 5.5 for Diploma."]).map((req: string, i: number) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</div>
                      <p>{req}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
                <h3 className="text-xl font-bold text-black mb-6">Postgraduate / Masters</h3>
                <ul className="space-y-4">
                  {(country.entry_requirements.pg || ["At least 55% in Bachelors Degree from a recognized university.", "IELTS - 6.5 overall with not less than 6.0 in each band."]).map((req: string, i: number) => (
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

      {/* Visa Process */}
      {country.visa_process && (
        <section className="py-24 bg-off-white">
          <div className="container max-w-4xl">
            <div className="text-center mb-16">
              <SectionLabel>Visa Process</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4">The Step-by-Step Journey</h2>
            </div>
            
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
              {country.visa_process.map((step: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-brand text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
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

      {/* Dynamic FAQs */}
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

function DestinationHero({ title, subtitle, description, image }: any) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-black text-white">
      <div className="absolute inset-0 opacity-40">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <SectionLabel className="text-white border-white/20 bg-white/10">{subtitle}</SectionLabel>
          <h1 className="text-5xl lg:text-7xl font-black mt-8 mb-8 leading-[0.9] tracking-tight">{title}</h1>
          <p className="text-xl text-gray-300 leading-relaxed">{description}</p>
        </div>
      </div>
    </section>
  );
}
