import { DestinationHero } from "@/components/destinations/DestinationContent";
import { CheckCircle2, ListChecks, GraduationCap, FileText, HelpCircle } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Schema from "@/components/shared/Schema";

export default function ItalyPage() {
  const faqData = {
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do I need to speak Italian to study in Italy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not for English-taught programmes — over 500 master's and many bachelor's programmes are taught fully in English. For Italian-taught programmes you must demonstrate B2 Italian."
        }
      },
      {
        "@type": "Question",
        "name": "What scholarships are available for Nepalese students in Italy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The biggest are DSU regional scholarships, means-tested by family income and merit, which can cover tuition, accommodation, and meals. Other options include Italian government scholarships and Erasmus Mundus joint programmes."
        }
      },
      {
        "@type": "Question",
        "name": "How many hours can international students work in Italy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Student visa holders can work up to 20 hours per week during academic terms and full-time during vacation periods, totalling a maximum of 1,040 hours per year."
        }
      }
    ]
  };

  return (
    <main>
      <Schema type="FAQPage" data={faqData} />
      <DestinationHero 
        title="Study in Italy"
        subtitle="Study Abroad"
        description="Italy combines world-class universities with affordable tuition and generous scholarship opportunities, making it an ideal destination for European education."
        image="/media-images/2021/05/Europe-web-banner.png"
      />

      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why Italy?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">Affordable Excellence & Culture</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Low Tuition & DSU Scholarships</h3>
                    <p className="text-gray-600 text-sm">Public university tuition is often €1,000–€4,000 per year, with scholarships covering accommodation and meals.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">English-Taught Master's</h3>
                    <p className="text-gray-600 text-sm">Over 500 master's programmes are taught fully in English, especially in engineering, business, and design.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Italy's main intake is <strong>September/October</strong>. Pre-enrolment via Universitaly typically happens between May and July.
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {["Academic Transcripts", "Declaration of Value (DoV)", "IELTS/PTE Score", "Statement of Purpose", "Universitaly Pre-enrolment", "Passport Copy"].map((doc) => (
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
                  <p>IELTS 6.0 overall (English-taught) or B2 Italian.</p>
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
                  <p>IELTS 6.5 overall (English-taught) or B2 Italian.</p>
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
            <h2 className="text-3xl font-bold text-black mt-4">Type D Study Visa Journey</h2>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {[
              { title: "Universitaly Registration", text: "Complete pre-enrolment online between May and July." },
              { title: "Apply for NOC", text: "Obtain your No Objection Certificate online from MOEST." },
              { title: "Declaration of Value", text: "Get DoV/Verification for your academic documents via the Embassy." },
              { title: "Financial Proof", text: "Show minimum €6,500/year living expenses plus health insurance." },
              { title: "Visa Submission", text: "Submit Type D visa application at the Italian Embassy/VFS." }
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
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Language requirement?</h4>
              <p className="text-gray-600 text-sm">English programmes require IELTS 6.0+. Italian programmes require B2 level certification.</p>
            </div>
            <div className="bg-off-white p-8 rounded-3xl">
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Scholarships?</h4>
              <p className="text-gray-600 text-sm">DSU scholarships are regional and means-tested, covering tuition, stay, and meal vouchers.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
