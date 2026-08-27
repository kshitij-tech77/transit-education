"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionLabel from "@/components/shared/SectionLabel";

const reasons = [
  {
    eyebrow: "Accreditation",
    title: "ICEF Accredited Since 2015",
    body: "Among Nepal's few ICEF-verified agencies. Every student is guaranteed international-standard counselling and ethical recruitment — annually audited by the global education industry's independent watchdog.",
    cta: { label: "View our accreditation", href: "/accreditation" },
  },
  {
    eyebrow: "Network",
    title: "100+ Partner Universities",
    body: "Direct partnerships across Canada, Australia, UK, USA, and Europe — no middlemen. Faster offer letters, priority reviews, and guaranteed application tracking from our counsellors.",
    cta: { label: "Explore destinations", href: "/study-abroad/canada" },
  },
  {
    eyebrow: "Results",
    title: "2,000+ Students Placed",
    body: "Every placement backed by rigorous pre-assessment before any application. We only submit strong files — that consistency has made Transit Education one of Nepal's most trusted consultancies.",
    cta: null,
  },
  {
    eyebrow: "Coverage",
    title: "End-to-End, 4 Locations",
    body: "IELTS/PTE prep, SOP writing, visa filing, and pre-departure briefings — all in-house across Kathmandu, Itahari, Damak, and Damauli. One agency, every step covered.",
    cta: null,
  },
];

export default function WhyTransit() {
  return (
    <section className="py-20 bg-off-white border-t border-[#E5E4E0]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionLabel>Why us</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
            Why Nepali students choose <span className="text-brand">Transit</span>
          </h2>
        </motion.div>

        {/* Top row — 2 featured cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {reasons.slice(0, 2).map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-8 border border-[#E5E4E0] flex flex-col gap-4 hover:border-brand/30 transition-colors"
            >
              <span className="text-brand font-semibold text-[12px] uppercase tracking-widest">{r.eyebrow}</span>
              <h3 className="text-xl font-bold text-black leading-snug">{r.title}</h3>
              <p className="text-[14px] text-[#6B6966] leading-relaxed flex-1">{r.body}</p>
              {r.cta && (
                <Link
                  href={r.cta.href}
                  className="inline-flex items-center gap-1.5 text-brand font-semibold text-sm hover:gap-2.5 transition-all mt-2 self-start"
                >
                  {r.cta.label}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom row — 2 accent cards: white bg, brand left border */}
        <div className="grid md:grid-cols-2 gap-6">
          {reasons.slice(2).map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i + 2) * 0.08 }}
              className="bg-white rounded-2xl p-8 border border-[#E5E4E0] border-l-4 border-l-brand flex flex-col gap-3 hover:shadow-md hover:border-brand/30 transition-all"
            >
              <span className="text-brand font-semibold text-[12px] uppercase tracking-widest">{r.eyebrow}</span>
              <h3 className="text-xl font-bold text-black leading-snug">{r.title}</h3>
              <p className="text-[14px] text-[#6B6966] leading-relaxed">{r.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
