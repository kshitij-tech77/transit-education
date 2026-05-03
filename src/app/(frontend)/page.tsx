import Hero from "@/components/home/Hero";
import Destinations from "@/components/home/Destinations";
import WelcomeAbout from "@/components/home/WelcomeAbout";
import Services from "@/components/home/Services";
import WhyTransit from "@/components/home/WhyTransit";
import SuccessStories from "@/components/home/SuccessStories";
import TeamTeaser from "@/components/home/TeamTeaser";
import Testimonials from "@/components/home/Testimonials";
import LatestBlog from "@/components/home/LatestBlog";
import ContactCTA from "@/components/home/ContactCTA";
import BranchesStrip from "@/components/home/BranchesStrip";
import SectionLabel from "@/components/shared/SectionLabel";
import FAQAccordion from "@/components/shared/FAQAccordion";
import { readJson } from "@/lib/cms-data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transit Education | Your Transit to Global Destinations",
  description: "Nepal's most trusted study abroad consultancy. Expert visa guidance for Canada, Australia, UK, USA & Europe.",
};

export default async function Home() {
  const faqsAll = await readJson('faqs.json');
  const featuredFaqs = faqsAll
    .filter((f: any) => f.featured === true && f.status === 'Published')
    .slice(0, 6);

  // FAQ Schema for Homepage
  const faqSchema = featuredFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": featuredFaqs.map((f: any) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Hero />
      <Destinations />
      <WelcomeAbout />
      <Services />
      <WhyTransit />
      <SuccessStories />
      <TeamTeaser />
      <Testimonials />
      
      {/* FAQ Section */}
      <section className="py-24 bg-[#F7F3F3]">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <SectionLabel>Got Questions?</SectionLabel>
              <h2 className="text-4xl font-bold text-black mt-4">Expert Advice & FAQ</h2>
              <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                Everything you need to know about studying abroad, visa processes, and life in global destinations.
              </p>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
              <FAQAccordion items={featuredFaqs} />
            </div>
          </div>
        </div>
      </section>

      <LatestBlog />
      <ContactCTA />
      <BranchesStrip />
    </>
  );
}
