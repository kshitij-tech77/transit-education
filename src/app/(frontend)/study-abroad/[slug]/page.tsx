import { notFound } from "next/navigation";
import { DestinationHero } from "@/components/destinations/DestinationContent";
import SectionLabel from "@/components/shared/SectionLabel";
import { GraduationCap, CheckCircle2, ListChecks, HelpCircle } from "lucide-react";
import { readJson } from "@/lib/cms-data";
import FAQAccordion from "@/components/shared/FAQAccordion";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const countries = await readJson('countries.json');
  const country = countries.find((c: any) => c.id === slug && c.status === 'LIVE');

  if (!country) return {};

  const title = country.metaTitle || `Study in ${country.name} | Transit Education`;
  const description = country.metaDescription || `Everything you need to know about studying in ${country.name}. Visa requirements, tuition, and intakes.`;
  const image = "/media-images/2021/05/Logo-png_website.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://transiteducation.com.np/study-abroad/${slug}`,
      images: [{ url: image }],
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
  const countries = await readJson('countries.json');
  const country = countries.find((c: any) => c.id === slug && c.status === 'LIVE');

  if (!country) {
    notFound();
  }

  // Fetch FAQs for this page
  const faqsAll = await readJson('faqs.json');
  const pagePath = `study-abroad/${slug}`;
  const faqs = faqsAll
    .filter((f: any) => f.page === pagePath && f.status === 'Published')
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      
      <DestinationHero 
        title={country.heroTitle || `Study in ${country.name}`}
        subtitle="Study Abroad"
        description={country.whyStudy || `Comprehensive guide to studying in ${country.name}.`}
        image="/media-images/2021/05/Web-banner-Canada.png"
      />

      <section className="py-24 bg-[#F7F3F3]">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why {country.name}?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">Quality Education & Global Recognition</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-[#A93226] shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Academic Excellence</h3>
                    <p className="text-gray-600 text-sm">Institutions in {country.name} are known for their high standards and research contributions.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-[#A93226] shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Global Career Path</h3>
                    <p className="text-gray-600 text-sm">Degrees from {country.name} are recognized worldwide by employers and academic institutions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-[#A93226]" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {country.intakes || "Varies by institution. Contact us for details."}
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Quick Facts:</h3>
              <ul className="grid grid-cols-1 gap-3">
                <li className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle2 className="w-4 h-4 text-[#A93226]" /> Visa Time: {country.visaTime}</li>
                <li className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle2 className="w-4 h-4 text-[#A93226]" /> Tuition: {country.tuition}</li>
                <li className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle2 className="w-4 h-4 text-[#A93226]" /> Top Unis: {country.universities}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

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
