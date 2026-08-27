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
  { country: "Italy", slug: "italy", iso: "it", tagline: "Low Tuition" },
  { country: "Ireland", slug: "ireland", iso: "ie", tagline: "EU Tech Hub" },
];

export default function Destinations() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <SectionLabel>Global Opportunities</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4">
            Where do you want to study?
          </h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
            Choose from the world's most prestigious education destinations with expert guidance at every step.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="h-full"
            >
              <Link
                href={`/study-abroad/${dest.slug}`}
                className="group flex flex-col bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm p-5 md:p-7 min-h-40 md:min-h-55 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-brand/10 hover:border-brand/40 hover:-translate-y-1"
              >
                {/* Flag */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 overflow-hidden shrink-0">
                  <span className={`fi fi-${dest.iso} text-3xl md:text-4xl`} />
                </div>

                {/* Content — always at bottom of available space */}
                <div className="flex flex-col gap-2 mt-auto">
                  <h3 className="text-sm md:text-xl font-bold text-slate-900 leading-tight group-hover:text-brand transition-colors duration-200">
                    {dest.country}
                  </h3>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] md:text-[11px] font-bold uppercase tracking-wider group-hover:bg-brand/10 group-hover:text-brand transition-all duration-200 w-fit">
                    {dest.tagline}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
