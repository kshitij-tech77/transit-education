import { DestinationHero } from "@/components/destinations/DestinationContent";
import { CheckCircle2, ListChecks, GraduationCap, FileText, HelpCircle } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Schema from "@/components/shared/Schema";

export default function SouthKoreaPage() {
  const faqData = {
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do I need to know Korean to study in South Korea?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not for English-taught programmes, which are widely available at master's and PhD level. Korean-taught programmes require TOPIK Level 3 or 4. Many universities also offer one year of preparatory Korean language study."
        }
      },
      {
        "@type": "Question",
        "name": "What is the Global Korea Scholarship (GKS)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "GKS is the South Korean government's flagship scholarship for international students. It covers full tuition, a monthly living stipend, one year of Korean language training, return airfare, settlement allowance, and medical insurance."
        }
      },
      {
        "@type": "Question",
        "name": "Can D-2 student visa holders work part-time in South Korea?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes — after six months on a D-2 visa, students can apply for part-time work permission and work up to 20 hours per week during term time and unlimited hours during vacations."
        }
      }
    ]
  };

  return (
    <main>
      <Schema type="FAQPage" data={faqData} />
      <DestinationHero 
        title="Study in South Korea"
        subtitle="Study Abroad"
        description="South Korea has emerged as one of Asia's fastest-rising study destinations, backed by world-class universities and a strong post-graduation job market in technology."
        image="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Web-banner-South-Korea.png"
      />

      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionLabel>Why South Korea?</SectionLabel>
              <h2 className="text-3xl font-bold text-black mt-4 mb-8">Tech Innovation & Scholarships</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <GraduationCap className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Global Korea Scholarship (GKS)</h3>
                    <p className="text-gray-600 text-sm">Full tuition, monthly stipend, and airfare covered by the Korean government for eligible students.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">High-Tech Careers</h3>
                    <p className="text-gray-600 text-sm">Direct access to job markets in IT, engineering, and manufacturing with global giants like Samsung and LG.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                <ListChecks className="w-7 h-7 text-brand" /> Major Intakes
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                South Korea's main intake is <strong>March</strong> (start of academic year). A secondary intake runs in <strong>September</strong>. Language programmes have four intakes.
              </p>
              <h3 className="text-xl font-bold text-black mb-4">Required Documents:</h3>
              <ul className="grid grid-cols-1 gap-3">
                {["Academic Transcripts", "Statement of Purpose", "Study Plan", "IELTS/TOPIK Score", "Apostilled Documents", "Passport Copy"].map((doc) => (
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
                  <p>Minimum 70% in 12-year schooling (NEB +2).</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>IELTS 5.5-6.0 or TOPIK Level 3+.</p>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
              <h3 className="text-xl font-bold text-black mb-6">Postgraduate</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>Bachelor's degree with GPA 3.0/4.0 or equivalent.</p>
                </li>
                <li className="flex gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>IELTS 6.0-6.5 or TOPIK Level 4-5.</p>
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
            <h2 className="text-3xl font-bold text-black mt-4">D-2 Student Visa Journey</h2>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {[
              { title: "Certificate of Admission", text: "Receive your COA from a Korean university after admission." },
              { title: "Apply for NOC", text: "Obtain your No Objection Certificate online from MOEST." },
              { title: "TB Test", text: "Complete mandatory TB health check at IOM Kathmandu." },
              { title: "Apostille Documents", text: "Get your academic documents apostilled for official recognition." },
              { title: "Embassy Submission", text: "Apply for D-2 visa at the Korean Embassy in Kathmandu." }
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
              <p className="text-gray-600 text-sm">English-taught programmes are available. Korean programmes require TOPIK Level 3 or 4.</p>
            </div>
            <div className="bg-off-white p-8 rounded-3xl">
              <h4 className="font-bold text-black mb-4 flex gap-2"><HelpCircle className="w-5 h-5 text-brand shrink-0" /> GKS Scholarship?</h4>
              <p className="text-gray-600 text-sm">Covers full tuition, living stipend, airfare, and one year of Korean language training.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
