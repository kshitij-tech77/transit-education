import { ShieldCheck } from "lucide-react";

const BADGES = [
  { label: "ICEF Accredited", sub: "International Certified" },
  { label: "Education UK", sub: "British Council Partner" },
  { label: "QEAC Certified", sub: "Qualified Education Agent" },
  { label: "USATC Member", sub: "US Admission Trained" },
  { label: "Canada ACEC", sub: "Canada Course Trained" },
  { label: "NZEAC Member", sub: "New Zealand Trained" },
];

export default function CertificationBadges() {
  return (
    <section className="py-12 bg-black border-y border-white/5">
      <div className="container">
        <p className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest mb-8">
          Internationally Recognised Certifications & Memberships
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {BADGES.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 hover:border-brand/40 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-white text-sm font-bold leading-none">{b.label}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
