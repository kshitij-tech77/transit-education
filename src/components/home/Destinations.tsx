"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import "flag-icons/css/flag-icons.min.css";

const destinations = [
  { country: "Canada", slug: "canada", iso: "ca", tagline: "Most Popular" },
  { country: "Australia", slug: "australia", iso: "au", tagline: "Work Rights" },
  { country: "United Kingdom", slug: "uk", iso: "gb", tagline: "1-Year Masters" },
  { country: "USA", slug: "usa", iso: "us", tagline: "Top Universities" },
  { country: "New Zealand", slug: "new-zealand", iso: "nz", tagline: "Safe & Quality" },
  { country: "South Korea", slug: "south-korea", iso: "kr", tagline: "KGSP Scholarship" },
  { country: "Europe", slug: "italy", iso: "eu", tagline: "Low Tuition" },
  { country: "Ireland", slug: "ireland", iso: "ie", tagline: "EU Tech Hub" },
];

export default function Destinations() {
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-20"
        >
          <SectionLabel>Global Opportunities</SectionLabel>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight">
            Where do you want to study?
          </h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
            Choose from the world's most prestigious education destinations with expert guidance at every step.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link 
                href={`/study-abroad/${dest.slug}`}
                className="group relative flex flex-col h-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-4 md:p-8 border border-slate-200/60 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-brand/10 md:hover:-translate-y-3"
              >
                {/* Flag Icon Wrapper */}
                <div className="mb-4 md:mb-10 relative">
                  <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                    <span className={`fi fi-${dest.iso} text-3xl md:text-5xl shadow-sm rounded-lg`} />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-auto">
                  <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1 md:mb-2 group-hover:text-brand transition-colors">
                    {dest.country}
                  </h3>
                  <div className="hidden md:flex items-center gap-3">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-widest group-hover:bg-brand/10 group-hover:text-brand transition-all">
                      {dest.tagline}
                    </span>
                    
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7 7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
