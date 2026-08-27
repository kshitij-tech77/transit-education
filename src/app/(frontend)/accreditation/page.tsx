import { Metadata } from "next";
import SectionLabel from "@/components/shared/SectionLabel";
import { ShieldCheck, Award, Globe2, GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ICEF Accredited Study Abroad Agency | Transit Education Nepal",
  description: "Transit Education is an ICEF accredited education agency in Nepal, verified for ethical recruitment and international-standard counselling. View our certifications and memberships.",
  alternates: { canonical: "https://transiteducation.com.np/accreditation" },
};

const CERTIFICATIONS = [
  {
    icon: Award,
    title: "ICEF Accredited Agency",
    body: "Transit Education is a verified ICEF (International Consultants for Education and Fairs) member — one of Nepal's few ICEF-accredited consultancies. ICEF accreditation is the gold standard in international student recruitment, confirming that our agency meets rigorous ethical and professional standards.",
    since: "Since 2015",
    color: "bg-amber-50 border-amber-200 text-amber-700",
    iconColor: "text-amber-600",
  },
  {
    icon: Globe2,
    title: "Education UK Partner",
    body: "Recognized by the British Council as a vetted Education UK partner agency. We hold authority to represent and provide accurate information about UK universities and colleges to Nepali students.",
    since: "British Council Verified",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "QEAC Certified",
    body: "Our counsellors hold QEAC (Qualified Education Agent Counsellor) certification, the Australian government-endorsed qualification for student counsellors advising on Australian study pathways.",
    since: "Australia QEAC",
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
  },
  {
    icon: GraduationCap,
    title: "USATC & ACEC Certified",
    body: "Certified under the US Admissions Training Certificate (USATC) and Canadian ACEC programs. Our team is trained by official bodies to counsel students on admission requirements and processes in the USA and Canada.",
    since: "USA & Canada",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    icon: CheckCircle2,
    title: "NZEAC Member",
    body: "Active member of the New Zealand Education Agent Counsellors (NZEAC) programme. Trained to advise students on New Zealand's world-class tertiary institutions and student visa process.",
    since: "New Zealand",
    color: "bg-teal-50 border-teal-200 text-teal-700",
    iconColor: "text-teal-600",
  },
];

export default function AccreditationPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-black py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--brand)_0%,_transparent_55%)] opacity-25" />
        <div className="container relative z-10">
          <SectionLabel className="text-white border-white/20 bg-white/10">Trust & Verification</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-6 max-w-2xl">
            Our Accreditations & Certifications
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            Transit Education is one of Nepal's most credentialed study abroad consultancies. Every certification below represents a commitment verified by an international body — not a self-claim.
          </p>
        </div>
      </section>

      {/* ICEF Certificate Feature */}
      <section className="py-16 bg-brand-surface">
        <div className="container">
          <div className="bg-white rounded-[2rem] border border-brand/20 shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl bg-brand flex items-center justify-center shrink-0 shadow-xl">
                <ShieldCheck className="w-16 h-16 md:w-24 md:h-24 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="inline-block bg-brand/10 text-brand text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">ICEF Verified Agency</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                  ICEF Accreditation
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  The International Consultants for Education and Fairs (ICEF) agency accreditation programme screens education agencies to ensure they meet internationally recognised standards of quality, ethics, and professionalism. Transit Education has maintained active ICEF accreditation since our founding in 2015 — an achievement shared by only a handful of consultancies in Nepal.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-brand/5 rounded-xl px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span className="text-sm font-semibold text-[#111111]">Annual compliance review</span>
                  </div>
                  <div className="flex items-center gap-2 bg-brand/5 rounded-xl px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span className="text-sm font-semibold text-[#111111]">Ethical recruitment guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 bg-brand/5 rounded-xl px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span className="text-sm font-semibold text-[#111111]">Active since 2015</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Certifications */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <SectionLabel>All Certifications</SectionLabel>
            <h2 className="text-3xl font-extrabold text-black mt-4">Every Credential, Explained</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Each certification below is issued by an independent international body. We don't just claim expertise — we prove it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CERTIFICATIONS.map((cert, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-6 ${cert.color} flex flex-col gap-4`}
              >
                <div className="flex items-start gap-4">
                  <cert.icon className={`w-8 h-8 shrink-0 mt-0.5 ${cert.iconColor}`} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{cert.since}</span>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">{cert.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{cert.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 bg-[#111111] text-white">
        <div className="container max-w-3xl text-center">
          <SectionLabel className="text-white border-white/20 bg-white/10 mx-auto">Why It Matters</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-6 mb-6">
            Working with an accredited agency protects you
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-10">
            Unregistered consultancies operate without oversight. An ICEF-accredited agency is bound by a strict code of conduct, regularly audited, and accountable to international standards. When you choose Transit Education, you choose verified expertise — not just a promise.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand text-white font-bold px-8 py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5"
          >
            Book a Free Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
