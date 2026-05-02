"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import testimonialsData from "@/data/testimonials.json";

export default function Testimonials() {
  return (
    <section className="py-20 bg-off-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <SectionLabel>Student Stories</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black">Real Students. Real Results.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonialsData.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute top-6 right-6 opacity-10 text-brand group-hover:opacity-20 transition-opacity">
                <Quote size={48} />
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold mb-6">
                {t.country}
              </div>
              <div className="flex gap-1 mb-4 text-[#FFB800]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed mb-6 flex-1 italic">
                "{t.body}"
              </p>
              <div className="border-t border-gray-100 pt-6 flex items-center gap-4 mt-auto">
                {t.photo ? (
                  <img 
                    src={t.photo} 
                    alt={t.name} 
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-black">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.course}, {t.university}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
