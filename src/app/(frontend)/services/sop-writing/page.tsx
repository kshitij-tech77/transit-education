import SectionLabel from "@/components/shared/SectionLabel";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { FileText, CheckCircle2, AlertCircle, Lightbulb, Clock, Users2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SOP Writing Support Nepal | Statement of Purpose Help",
  description: "Expert SOP writing guidance for Canadian, Australian, UK, and US student visas. Our counsellors help Nepali students craft compelling statements of purpose that get approved.",
  alternates: { canonical: "https://transiteducation.com.np/services/sop-writing" },
  openGraph: {
    title: "SOP Writing Support | Transit Education Nepal",
    description: "A strong SOP is the difference between approval and rejection. Let our experts help you tell your story compellingly.",
    url: "https://transiteducation.com.np/services/sop-writing",
    type: "website",
  },
};

const SOP_STRUCTURE = [
  {
    step: "01",
    title: "Introduction",
    description: "Who you are, where you are from, and what motivated you to pursue this specific program — written to immediately capture the reader's attention.",
  },
  {
    step: "02",
    title: "Academic Background",
    description: "Your educational journey, key achievements, relevant coursework, and academic strengths that directly connect to your chosen program.",
  },
  {
    step: "03",
    title: "Professional Experience",
    description: "Work experience, internships, volunteer work, or projects that demonstrate real-world skills relevant to your field of study.",
  },
  {
    step: "04",
    title: "Why This Course & Country",
    description: "Your specific reasons for choosing this program, institution, and destination — must be specific and research-backed, not generic.",
  },
  {
    step: "05",
    title: "Future Goals",
    description: "Clear, realistic career plans and how this qualification enables them — visa officers need to see genuine intent to return and contribute.",
  },
  {
    step: "06",
    title: "Conclusion",
    description: "A confident summary of your suitability and a strong closing that reinforces your genuine motivation for studying abroad.",
  },
];

const COMMON_MISTAKES = [
  "Copying SOP templates found online — detected immediately by visa officers",
  "Generic statements like 'Canada is a great country' with no specifics",
  "Failing to explain why this specific university and program",
  "Inconsistency between SOP content and other documents (finances, transcripts)",
  "Writing in overly formal or unnatural English that doesn't sound genuine",
  "Not addressing gaps in education or employment history",
  "Exceeding word limits or writing well below the recommended length",
];

const WHAT_WE_DO = [
  {
    icon: <Users2 className="w-6 h-6" />,
    title: "Profile Understanding Session",
    description: "30-minute consultation to understand your academic history, motivations, goals, and the specific program requirements.",
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Story Framework Development",
    description: "We build your unique narrative — identifying the strongest points from your profile to create a compelling, logical flow.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Draft Writing & Review",
    description: "Our team writes the first draft. You review, we incorporate feedback, and refine until you're fully satisfied.",
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Consistency Check",
    description: "We cross-check your SOP against all supporting documents — transcripts, bank statements, work letters — to ensure zero contradictions.",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "48-Hour Turnaround",
    description: "Standard turnaround of 48 hours for initial draft. Rush delivery available for urgent application deadlines.",
  },
  {
    icon: <AlertCircle className="w-6 h-6" />,
    title: "Country-Specific Optimisation",
    description: "Canada SOPs differ from UK SOPs differ from Australian visa statements. We tailor every document to the exact requirements of the destination.",
  },
];

export default function SopWritingPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/03/paper-business-finance-3309829.jpg"
            alt="SOP Writing"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="container relative z-10">
          <Breadcrumb items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services/sop-writing" },
            { label: "SOP Writing Support" },
          ]} />
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">
              Document Support
            </SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              SOP Writing That <span className="text-brand">Gets Approved</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Your Statement of Purpose is the single most important document in your visa and university application. A weak SOP gets rejected — even with strong grades and IELTS scores. Our experts help you craft a story that visa officers and admissions committees trust.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-black transition-all"
              >
                Book SOP Consultation
              </Link>
              <a
                href="https://wa.me/9779851315991"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is SOP */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel>What is an SOP?</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-6">
                The Document That Defines Your Application
              </h2>
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>
                  A Statement of Purpose (SOP) — also called a Personal Statement or Study Plan — is a written document explaining who you are, why you want to study a specific program, and what you plan to do after graduation.
                </p>
                <p>
                  For visa applications (Canada, Australia, UK, USA), the SOP is reviewed by immigration officers who use it to assess your genuine intention to study — and your intention to return to Nepal afterward. A poorly written SOP is the most common reason for visa rejection, even when finances and qualifications are strong.
                </p>
                <p>
                  For university admissions, the SOP is how you stand out from thousands of applicants with similar grades and scores.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { label: "Canada SOP", sub: "Study Permit" },
                  { label: "Australia SOP", sub: "Student Visa" },
                  { label: "UK SOP", sub: "Student Route" },
                  { label: "USA SOP", sub: "F-1 Visa + Admissions" },
                  { label: "Germany SOP", sub: "Motivationsschreiben" },
                  { label: "New Zealand SOP", sub: "Student Visa" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-off-white border border-gray-100 rounded-2xl p-4 text-center"
                  >
                    <p className="font-bold text-black text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <h3 className="text-2xl font-bold mb-6">Get Your Free SOP Assessment</h3>
              <p className="text-white/80 mb-8 text-sm leading-relaxed">
                Share your existing SOP or tell us about your profile, and our counsellors will identify the weak points and tell you exactly what needs to change.
              </p>
              <ul className="space-y-3 mb-8">
                {["Free 30-min profile session", "SOP review and feedback", "Destination-specific guidance", "Consistency check included"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-white/70 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="inline-block bg-white text-brand px-8 py-4 rounded-full font-bold hover:bg-black hover:text-white transition-all"
              >
                Start Free Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>Our Process</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">
              How We Build Your SOP
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHAT_WE_DO.map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:border-brand/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOP Structure */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel className="text-white border-white/20 bg-white/10">
              Structure Guide
            </SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">
              What a Strong SOP Contains
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SOP_STRUCTURE.map((item, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-3xl p-6 hover:border-brand/40 transition-colors"
              >
                <div className="text-brand text-4xl font-black mb-4">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <SectionLabel>What to Avoid</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">
                Common SOP Mistakes That Cause Rejections
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {COMMON_MISTAKES.map((mistake, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-6 bg-red-50 border border-red-100 rounded-2xl"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-lg font-black">
                    ✗
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{mistake}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="bg-brand rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Write an SOP That Gets Results?
              </h2>
              <p className="text-white/80 mb-10 leading-relaxed">
                Book a free 30-minute consultation with our document specialists. We'll review your profile, identify the key selling points, and explain exactly how your SOP should be structured for maximum impact.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-brand px-8 py-4 rounded-full font-bold hover:bg-black hover:text-white transition-all"
                >
                  Book Free SOP Consultation
                </Link>
                <a
                  href="https://wa.me/9779851315991"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white border border-white/30 px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all"
                >
                  WhatsApp Us Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
