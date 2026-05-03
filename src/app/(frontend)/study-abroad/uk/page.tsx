import { DestinationHero } from "@/components/destinations/DestinationContent";
import { CheckCircle2, ListChecks, GraduationCap, FileText, HelpCircle } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Schema from "@/components/shared/Schema";

export default function UKPage() {
  const faqData = {
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can international students work part-time during their studies in the UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Student visa holders can work up to 20 hours per week during term time and full-time during scheduled vacations, provided the course is at degree level at a UK Higher Education Provider with track record."
        }
      },
      {
        "@type": "Question",
        "name": "What is the Graduate Route visa and how long can I stay after my degree?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Graduate Route is a post-study work visa that lets bachelor's and master's graduates stay in the UK for two years after completing their course (three years for PhD graduates) without needing a job offer or sponsorship."
        }
      },
      {
        "@type": "Question",
        "name": "How much money do I need to show for a UK student visa from Nepal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You must show one academic year of tuition (or the unpaid balance) plus living costs of £1,334/month for London or £1,023/month for outside London, for up to nine months. The funds must sit in a bank account in your name, your parent's, or your legal guardian's for 28 consecutive days before the application."
        }
      }
    ]
  };

  return (
    <main>
      <Schema type="FAQPage" data={faqData} />
      <DestinationHero 
        title="Study in the UK"
        subtitle="Study Abroad"
        description="The United Kingdom hosts four of the world's top ten universities and a higher-education tradition that goes back nearly a thousand years. For Nepalese students, the UK offers internationally recognised degrees and a clear path to global careers."
        image="/media/2021/05/web-banner-UK.png"
      />

      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why UK?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">Internationally Recognised Degrees</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Shorter Course Lengths</h3>
                    <p className="text-gray-600 text-sm">Three-year bachelor's and one-year master's degrees save time and reduce total cost compared to other destinations.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Graduate Route Visa</h3>
                    <p className="text-gray-600 text-sm">The Graduate Route lets graduates stay and work for up to two years (three for PhDs) without employer sponsorship.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                UK universities run two main intakes: <strong>September/October</strong> (primary) and <strong>January/February</strong> (secondary). A small May intake exists at some universities.
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {["Academic Transcripts", "Passport Copy", "IELTS/PTE Score", "Statement of Purpose", "Academic References", "CV / Resume"].map((doc) => (
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
              <h3 className="text-xl font-bold text-black mb-6">Undergraduate (Bachelor's)</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>Minimum 60–70% in 12-year schooling (NEB +2 / A-Levels).</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>IELTS 6.0–6.5 overall (no individual band below 5.5).</p>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
              <h3 className="text-xl font-bold text-black mb-6">Postgraduate (Master's)</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>Bachelor's degree with at least 50–60% aggregate.</p>
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
            <h2 className="text-3xl font-bold text-black mt-4">The UK Student Visa Journey</h2>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {[
              { title: "Get your CAS", text: "Receive your Confirmation of Acceptance for Studies from your university." },
              { title: "Apply for NOC", text: "Obtain your No Objection Certificate online from MOEST." },
              { title: "Financial Proof", text: "Show 28 consecutive days of bank balance covering tuition and living costs." },
              { title: "TB Test", text: "Complete your mandatory TB test at IOM Kathmandu." },
              { title: "VFS Appointment", text: "Submit biometrics at VFS Global, Kathmandu and await decision." }
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
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Graduate Route visa?</h4>
              <p className="text-gray-600 text-sm">Bachelor's and master's graduates can stay for two years, and PhD graduates for three years, to work or look for work.</p>
            </div>
            <div className="bg-off-white p-8 rounded-3xl">
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Financial requirement?</h4>
              <p className="text-gray-600 text-sm">You must show tuition fees plus living costs (£1,334/mo in London, £1,023/mo outside) for 9 months.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
