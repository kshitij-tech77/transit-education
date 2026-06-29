import Link from "next/link";
import SectionLabel from "@/components/shared/SectionLabel";
import { Calculator, GraduationCap, DollarSign, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Study Abroad Tools | IELTS Calculator, GPA Converter, Cost Estimator",
  description: "Free tools for Nepali students planning to study abroad. Calculate IELTS band scores, convert Nepal NEB/SLC percentage to GPA, and estimate cost of studying in Canada, Australia, UK, and Germany.",
  alternates: { canonical: "https://transiteducation.com.np/tools" },
  openGraph: {
    title: "Free Study Abroad Tools | Transit Education Nepal",
    description: "IELTS Band Calculator, GPA Converter (NEB to GPA), and Study Abroad Cost Calculator — free tools for Nepali students.",
    url: "https://transiteducation.com.np/tools",
    type: "website",
  },
};

const TOOLS = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "IELTS Band Score Calculator",
    description:
      "Enter your Listening, Reading, Writing, and Speaking scores to calculate your overall IELTS band. Instantly see which countries and programs your score qualifies for.",
    href: "/tools/ielts-band-calculator",
    tag: "Most Used",
    color: "bg-brand text-white",
  },
  {
    icon: <Calculator className="w-8 h-8" />,
    title: "GPA Converter (NEB/SLC to GPA)",
    description:
      "Convert your Nepal NEB percentage (Class 11/12) or Bachelor's percentage to the 4.0 GPA scale used by universities in Canada, USA, UK, and Australia.",
    href: "/tools/gpa-converter",
    tag: "Popular",
    color: "bg-black text-white",
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Study Abroad Cost Calculator",
    description:
      "Estimate your total cost of studying in Canada, Australia, UK, USA, Germany, or New Zealand. Includes tuition, living costs, health insurance, and visa fees.",
    href: "/tools/cost-calculator",
    tag: "New",
    color: "bg-[#2563EB] text-white",
  },
];

export default function ToolsPage() {
  return (
    <main className="pt-20">
      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="container relative z-10 text-center">
          <SectionLabel className="text-white border-white/20 bg-white/10 mx-auto">
            100% Free
          </SectionLabel>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8">
            Free Tools for <span className="text-brand">Nepali Students</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Calculate IELTS scores, convert GPA, and estimate your study abroad budget — all in one place, completely free.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TOOLS.map((tool, i) => (
              <Link
                key={i}
                href={tool.href}
                className="group flex flex-col bg-off-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tool.color}`}>
                    {tool.icon}
                  </div>
                  <span className="text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-1">
                    {tool.tag}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-black mb-4 leading-tight group-hover:text-brand transition-colors">
                  {tool.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{tool.description}</p>
                <div className="mt-6 flex items-center gap-2 text-brand font-bold text-sm">
                  Open Tool <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-off-white border-t border-gray-100">
        <div className="container text-center">
          <p className="text-gray-500 text-sm mb-4">
            Need personalised guidance beyond these tools?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all"
          >
            Book Free Consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
