import { Metadata } from "next";
import { ShieldCheck, Clock, FileCheck } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import CountryTabs, { CountryTab } from "@/components/compliance/CountryTabs";

export const metadata: Metadata = {
  title: "Student Compliance Guide | Transit Education Nepal",
  description:
    "Country-by-country compliance guidance for Nepali students studying abroad — visa rules, work rights, enrolment requirements, and what to do before and after you arrive.",
  alternates: { canonical: "https://transiteducation.com.np/compliance" },
};

const TABS: CountryTab[] = [
  { id: "australia", label: "Australia", flag: "🇦🇺" },
  { id: "uk",        label: "UK",        flag: "🇬🇧" },
  { id: "usa",       label: "USA",       flag: "🇺🇸" },
  { id: "canada",    label: "Canada",    flag: "🇨🇦" },
  { id: "others",    label: "Others",    flag: "🌍" },
];

const HERO_FEATURES = [
  { icon: ShieldCheck, label: "Visa-compliant guidance" },

  { icon: Clock,       label: "Updated for 2025" },
  { icon: FileCheck,   label: "Expert-verified" },
];

export default function CompliancePage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-28 overflow-hidden bg-black text-white">
        {/* Banner image */}
        <div className="absolute inset-0 opacity-35">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1920&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Gradient overlay so text is always readable */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />

        <div className="container relative z-10">
          <SectionLabel className="text-white border-white/20 bg-white/10">
            Student Compliance
          </SectionLabel>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mt-6 mb-5 max-w-2xl leading-tight tracking-tight">
            Know Your Rights &amp; Responsibilities
          </h1>
          <p className="text-gray-300 text-lg max-w-xl leading-relaxed mb-10">
            Every country has its own rules for international students — visa
            conditions, work limits, enrolment requirements. This guide covers
            what you need to stay compliant, country by country.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {HERO_FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full px-4 py-2"
              >
                <Icon className="w-4 h-4 text-brand shrink-0" />
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs + content */}
      <CountryTabs tabs={TABS} defaultTab="australia" />
    </main>
  );
}
