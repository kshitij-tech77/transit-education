import SectionLabel from "@/components/shared/SectionLabel";
import Schema from "@/components/shared/Schema";
import { DestinationHero } from "@/components/destinations/DestinationContent";
import { GraduationCap, CheckCircle2, ListChecks, FileText, HelpCircle } from "lucide-react";

export default function CanadaPage() {
  const faqData = {
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I work part-time while studying in Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, international students in Canada are generally allowed to work up to 20 hours per week during academic sessions and full-time during scheduled breaks."
        }
      },
      {
        "@type": "Question",
        "name": "Does a diploma from a Canadian college hold value?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Canadian colleges provide career-oriented programs like Advanced Diplomas and Certificates that are highly valued by employers for developing practical, saleable skills."
        }
      },
      {
        "@type": "Question",
        "name": "What are the living expenses for international students in Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Government of Canada estimates the minimum living cost for a single student to be around CAD 20,635 per year (outside Quebec) in 2026, plus tuition and travel costs."
        }
      }
    ]
  };

  return (
    <main>
      <Schema type="FAQPage" data={faqData} />
      <DestinationHero 
        title="Study in Canada"
        subtitle="Study Abroad"
        description="Canada offers an overabundance of opportunities for international students. It is fast emerging as one of the most favoured destinations and is home to some of the top 100 universities in the world."
        image="/media-images/2021/05/Web-banner-Canada.png"
      />

      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why Canada?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">World-Class Education & Post-Study Work</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Quality & Variety</h3>
                    <p className="text-gray-600 text-sm">The Canadian education system is well recognized for its quality as well as the variety of academic programs they offer.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Work & PR Path</h3>
                    <p className="text-gray-600 text-sm">International students can apply for their work permit and PR after completing education in Canada.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Canada normally has three intakes in a year: <strong>January, May & September</strong>. However, private colleges may have extra intakes too. We suggest students start their application at least 4 months before the class start date.
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {["Transcript & Degree", "Resume", "Letter of Recommendation", "Statement of Purpose (SOP)", "IELTS/PTE Score", "Passport Copy"].map((doc) => (
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
              <h3 className="text-xl font-bold text-black mb-6">Undergraduate / Bachelors</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>At least 3.0 GPA in High School Certificate.</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>IELTS 6.5 with each band 6.0 (Diploma: 6.0 with each band 5.5).</p>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
              <h3 className="text-xl font-bold text-black mb-6">Masters / Postgraduate</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>At least first division in Bachelors Degree.</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>IELTS 6.5 overall with each band 6.0.</p>
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
            <h2 className="text-3xl font-bold text-black mt-4">The Step-by-Step Journey</h2>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {[
              { title: "Offer Letter", text: "Apply for standardized letter of acceptance from a Designated Learning Institution (DLI)." },
              { title: "No Objection Certificate", text: "Apply for NOC online from the Ministry of Education (MOE)." },
              { title: "Tuition Fee Payment", text: "Pay your fees via NOC and PAN card to get confirmation of receipt." },
              { title: "Medical Examination", text: "Undergo compulsory medical exam from empanelled doctors (IOM/Travel Medicine Center)." },
              { title: "Biometric & Submission", text: "Submit your biometrics at VFS Global and lodge your visa application via GCKey." }
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
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Can I work part-time?</h4>
              <p className="text-gray-600 text-sm">Yes, international students are allowed to work off-campus for 20 hours/week during studies and 40 hours/week during vacations.</p>
            </div>
            <div className="bg-off-white p-8 rounded-3xl">
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> Does a Diploma hold value?</h4>
              <p className="text-gray-600 text-sm">Colleges provide career-oriented programs like Advanced Diplomas/Certificates for developing saleable skills in chosen careers.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
