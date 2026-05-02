"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";

const destinations = [
  { country: "Canada", slug: "canada", flag: "🇨🇦", tagline: "Most Popular · PR Pathway" },
  { country: "Australia", slug: "australia", flag: "🇦🇺", tagline: "Work While You Study" },
  { country: "United Kingdom", slug: "uk", flag: "🇬🇧", tagline: "1-Year Masters" },
  { country: "USA", slug: "usa", flag: "🇺🇸", tagline: "Top Research Universities" },
  { country: "New Zealand", slug: "new-zealand", flag: "🇳🇿", tagline: "Safe & Welcoming" },
  { country: "South Korea", slug: "south-korea", flag: "🇰🇷", tagline: "KGSP Scholarships" },
  { country: "Ireland", slug: "ireland", flag: "🇮🇪", tagline: "English-speaking EU" },
  { country: "Italy", slug: "italy", flag: "🇮🇹", tagline: "Affordable European Education" },
];

export default function Destinations() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <SectionLabel>Destinations</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black">Where do you want to study?</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
            >
              <Link 
                href={`/study-abroad/${dest.slug}`}
                className="block bg-[#F8F8F8] border border-[#EFEFEF] p-5 rounded-[10px] transition-all hover:bg-[#FFF5F5] hover:border-brand hover:-translate-y-0.5 group"
              >
                <div className="text-[32px] leading-none mb-2">{dest.flag}</div>
                <h3 className="font-medium text-[13px] text-black mb-1">{dest.country}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{dest.tagline}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
