import { DestinationHero } from "@/components/destinations/DestinationContent";
import { CheckCircle2, ListChecks, GraduationCap, FileText, HelpCircle } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Schema from "@/components/shared/Schema";

export default function USAPage() {
  const faqData = {
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can F-1 students work in the USA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes — on-campus jobs up to 20 hours per week during term and 40 hours during vacations, no separate work permit needed. Off-campus work requires CPT (during studies) or OPT (post-graduation)."
        }
      },
      {
        "@type": "Question",
        "name": "What is OPT and STEM OPT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OPT is 12 months of post-graduation work authorisation in your field of study. If your degree is in a Department of Homeland Security-listed STEM field, you can apply for a 24-month STEM OPT extension, totalling 36 months of post-study work."
        }
      },
      {
        "@type": "Question",
        "name": "How much funding do I need to show for an F-1 visa from Nepal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You must demonstrate enough funds to cover the first year's total cost of attendance shown on your I-20 — typically USD 35,000 to 80,000 depending on the university. Funds can be a mix of personal/family bank balance, education loan, scholarship, and assistantship offers."
        }
      }
    ]
  };

  return (
    <main>
      <Schema type="FAQPage" data={faqData} />
      <DestinationHero 
        title="Study in the USA"
        subtitle="Study Abroad"
        description="The United States is the world's largest higher-education ecosystem, with more than 4,000 accredited universities and the broadest range of programmes anywhere."
        image="/media-images/2021/05/Web-banner-USA.png"
      />

      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why USA?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">World-Leading Research & Flexibility</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">OPT & STEM OPT</h3>
                    <p className="text-gray-600 text-sm">Up to 36 months of post-study work for STEM graduates without employer sponsorship.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Generous Funding</h3>
                    <p className="text-gray-600 text-sm">Assistantships, fellowships, and merit scholarships are widely available, especially for graduate students.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                US universities run three intakes: <strong>Fall (August/September)</strong> is the main intake; <strong>Spring (January)</strong> is substantial; and <strong>Summer (May)</strong> is for select starts.
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {["Academic Transcripts", "TOEFL/IELTS/PTE Score", "SAT/GRE/GMAT (if required)", "Statement of Purpose", "Letters of Recommendation", "Passport Copy"].map((doc) => (
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
                  <p>Minimum GPA 3.0/4.0 (≈ 70% in NEB) or higher for top-tier schools.</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>TOEFL iBT 79+, IELTS 6.5+, or Duolingo 105+.</p>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
              <h3 className="text-xl font-bold text-black mb-6">Postgraduate</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>Bachelor's degree (16 years) with GPA 3.0+.</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>TOEFL 90+ or IELTS 6.5+; GRE/GMAT as required.</p>
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
            <h2 className="text-3xl font-bold text-black mt-4">F-1 Student Visa Journey</h2>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {[
              { title: "Get your I-20", text: "Apply to a SEVP-certified university and receive your I-20 form." },
              { title: "SEVIS Fee", text: "Pay the SEVIS I-901 fee ($350) and keep the receipt." },
              { title: "DS-160 Form", text: "Complete the online non-immigrant visa application and upload a US-spec photo." },
              { title: "Schedule Interview", text: "Pay the MRV fee and schedule biometrics and interview at the US Embassy." },
              { title: "Visa Interview", text: "Attend the interview at Maharajgunj with all required academic and financial records." }
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
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Can F-1 students work?</h4>
              <p className="text-gray-600 text-sm">Yes, on-campus up to 20 hours/week. Off-campus requires CPT or OPT authorisation.</p>
            </div>
            <div className="bg-off-white p-8 rounded-3xl">
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> What is OPT?</h4>
              <p className="text-gray-600 text-sm">Optional Practical Training allows you to work in your field for 12 months (36 months for STEM).</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
