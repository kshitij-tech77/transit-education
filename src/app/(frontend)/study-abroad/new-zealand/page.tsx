import { DestinationHero } from "@/components/destinations/DestinationContent";
import { CheckCircle2, ListChecks, GraduationCap, FileText, HelpCircle } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Schema from "@/components/shared/Schema";

export default function NewZealandPage() {
  const faqData = {
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How many hours can international students work in New Zealand?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Student visa holders can generally work up to 20 hours per week during the academic term and full-time during scheduled course breaks. PhD and master's research students can work full-time throughout their study."
        }
      },
      {
        "@type": "Question",
        "name": "How long can I stay in New Zealand after graduation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Post-Study Work Visa allows 1, 2, or 3 years of open work rights after qualifying study, depending on the level of qualification and the location of study."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum bank balance required for a New Zealand student visa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You must show NZD 20,000 per year for living costs (or NZD 1,667 per month for stays under one year), plus full payment of the first year's tuition or an arrangement to pay it."
        }
      }
    ]
  };

  return (
    <main>
      <Schema type="FAQPage" data={faqData} />
      <DestinationHero 
        title="Study in New Zealand"
        subtitle="Study Abroad"
        description="New Zealand offers a British-system education within a small, safe, and welcoming country. All eight of its universities sit in the QS world top 500."
        image="/assets/wp-media/2021/05/Web-banner-New-Zealand.png"
      />

      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why NZ?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">High-Quality Education & Safety</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">QS Top 500 Universities</h3>
                    <p className="text-gray-600 text-sm">All 8 universities are highly ranked, ensuring global recognition for your degree.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Post-Study Work Rights</h3>
                    <p className="text-gray-600 text-sm">Up to 3 years of open work rights to gain professional experience after graduation.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                NZ universities run two main intakes: <strong>February</strong> (primary) and <strong>July</strong> (secondary). November intakes are available at some polytechnics.
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {["Academic Certificates", "IELTS/PTE Score", "Statement of Purpose", "Academic References", "Police Clearance", "Passport Copy"].map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand" /> {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Entry Requirements</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4">Eligibility for Nepali Students</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-brand/5 border border-brand/10">
              <h3 className="text-xl font-bold text-black mb-6">Undergraduate</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>Minimum 60% in 12-year schooling (NEB +2).</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>IELTS 6.0 overall (no individual band below 5.5).</p>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
              <h3 className="text-xl font-bold text-black mb-6">Postgraduate</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>Bachelor's degree from a recognised university.</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>IELTS 6.5 overall (no individual band below 6.0).</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-off-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <SectionLabel>Visa Process</SectionLabel>
            <h2 className="text-3xl font-bold text-black mt-4">NZ Student Visa Journey</h2>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {[
              { title: "Offer of Place", text: "Receive an offer from an NZQA-approved education provider." },
              { title: "Apply for NOC", text: "Obtain your No Objection Certificate online from MOEST." },
              { title: "Medical & Police", text: "Complete medical exam at IOM and get police clearance." },
              { title: "Financial Proof", text: "Show NZ$ 20,000/year living expenses plus tuition." },
              { title: "Visa Submission", text: "Apply for Fee Paying Student visa online via Immigration NZ." }
            ].map((step, i) => (
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

      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Questions?</SectionLabel>
            <h2 className="text-3xl font-bold text-black mt-4">Frequently Asked Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-off-white p-8 rounded-3xl">
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Working hours?</h4>
              <p className="text-gray-600 text-sm">Most students can work 20 hours/week during term and full-time during breaks.</p>
            </div>
            <div className="bg-off-white p-8 rounded-3xl">
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Post-study work?</h4>
              <p className="text-gray-600 text-sm">A Level 7 or higher degree allows up to 3 years of open work rights.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
