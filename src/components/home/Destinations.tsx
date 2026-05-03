"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";

const destinations = [
  { country: "Canada", slug: "canada", flag: "🇨🇦", tagline: "Most Popular", image: "/media/2021/05/Web-banner-Canada.png" },
  { country: "Australia", slug: "australia", flag: "🇦🇺", tagline: "Work Rights", image: "/media/2021/05/Wwb-banner-Australia.png" },
  { country: "UK", slug: "uk", flag: "🇬🇧", tagline: "1-Year Masters", image: "/media/2021/05/web-banner-UK.png" },
  { country: "USA", slug: "usa", flag: "🇺🇸", tagline: "Top Universities", image: "/media/2021/05/Web-banner-USA.png" },
  { country: "New Zealand", slug: "new-zealand", flag: "🇳🇿", tagline: "Safe & Quality", image: "/media/2021/05/Web-banner-New-Zealand.png" },
  { country: "South Korea", slug: "south-korea", flag: "🇰🇷", tagline: "KGSP Scholarship", image: "/media/2025/03/Korea.png" },
  { country: "Europe", slug: "italy", flag: "🇪🇺", tagline: "Low Tuition", image: "/media/2021/05/Europe-web-banner.png" },
  { country: "Ireland", slug: "ireland", flag: "🇮🇪", tagline: "EU Tech Hub", image: "/media/2021/05/Europe-web-banner.png" },
];

export default function Destinations() {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <SectionLabel>Destinations</SectionLabel>
          <h2 className="text-3xl md:text-5xl font-extrabold text-black mt-4">Where do you want to study?</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="group relative block aspect-[1.1/1] overflow-hidden rounded-[2rem] bg-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-brand/20 hover:-translate-y-2"
              >
                <img 
                  src={dest.image} 
                  alt={dest.country} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">{dest.flag}</span>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <span className="text-white">→</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{dest.country}</h3>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">{dest.tagline}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
