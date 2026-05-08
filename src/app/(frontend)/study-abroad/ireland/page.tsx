import { DestinationHero } from "@/components/destinations/DestinationContent";
import { CheckCircle2, ListChecks, GraduationCap, FileText, HelpCircle } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Schema from "@/components/shared/Schema";

export default function IrelandPage() {
  const faqData = {
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How many hours can international students work in Ireland?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Students on Stamp 2 (full-time degree at an ILEP-listed programme) can work up to 20 hours per week during term time and 40 hours per week during scheduled holiday periods."
        }
      },
      {
        "@type": "Question",
        "name": "What is the Third Level Graduate Programme in Ireland?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Third Level Graduate Programme (Stamp 1G) allows non-EU graduates of Level 8 (bachelor's) programmes to remain in Ireland for 12 months and Level 9 or 10 (master's or PhD) graduates to remain for up to 24 months to seek employment."
        }
      },
      {
        "@type": "Question",
        "name": "How much money do I need to show for an Ireland student visa from Nepal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You must show evidence of EUR 10,000 in your bank account (or a sponsor's) for living expenses for one year, plus proof that the first year's tuition has been paid in full."
        }
      }
    ]
  };

  return (
    <main>
      <Schema type="FAQPage" data={faqData} />
      <DestinationHero 
        title="Study in Ireland"
        subtitle="Study Abroad"
        description="Ireland is the only English-speaking country in the European Union, offering globally ranked universities and a strong technology job market."
        image="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Europe-web-banner.png"
      />

      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why Ireland?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">Tech Hub of Europe</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Major Tech & Pharma Hub</h3>
                    <p className="text-gray-600 text-sm">Dublin hosts EU headquarters for Google, Meta, Apple, and Pfizer, offering immense career potential.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Post-Study Work (Stamp 1G)</h3>
                    <p className="text-gray-600 text-sm">Up to 24 months of post-study work for master's graduates to seek employment in Ireland.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Ireland has two main intakes: <strong>September</strong> (primary) and <strong>January</strong> (secondary, mainly for select master's programmes).
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {["Academic Transcripts", "IELTS/PTE Score", "Statement of Purpose", "Academic References", "Tuition Fee Receipt", "Passport Copy"].map((doc) => (
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
                  <p>IELTS 6.0–6.5 overall (no individual band below 5.5).</p>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
              <h3 className="text-xl font-bold text-black mb-6">Postgraduate</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>Bachelor's degree with at least 60% aggregate.</p>
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
            <h2 className="text-3xl font-bold text-black mt-4">D Study Visa Journey</h2>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {[
              { title: "Letter of Acceptance", text: "Receive an unconditional offer from an ILEP-listed programme." },
              { title: "Apply for NOC", text: "Obtain your No Objection Certificate online from MOEST." },
              { title: "Tuition Fee Payment", text: "Pay your full first-year tuition fee and get the receipt." },
              { title: "Financial Proof", text: "Show €10,000 for living costs plus private medical insurance." },
              { title: "Visa Submission", text: "Apply for D Study visa online and submit documents to VFS Kathmandu." }
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
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Working rights?</h4>
              <p className="text-gray-600 text-sm">Work up to 20 hours/week during term and 40 hours/week during vacations.</p>
            </div>
            <div className="bg-off-white p-8 rounded-3xl">
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Post-study work?</h4>
              <p className="text-gray-600 text-sm">Stamp 1G allows 12 months for bachelor's and 24 months for master's graduates.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
