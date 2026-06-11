"use client";

import { motion } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import { resolveMediaUrl } from "@/lib/media-url";

/* Fix #13 — normalize testimonial cards: photo, name, degree, university, flag, year, 5-star */
function getYear(createdAt: string | null | undefined): string {
  if (!createdAt) return new Date().getFullYear().toString();
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return new Date().getFullYear().toString();
  return d.getFullYear().toString();
}

export default function Testimonials({ testimonials }: { testimonials: any[] }) {
  const testimonialsData = testimonials || [];
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

          {/* Google Reviews badge */}
          <a
            href="https://www.google.com/search?q=Transit+Education+Nepal+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-800">4.9</span>
            <span className="text-sm text-gray-500">Google Reviews</span>
            <ExternalLink size={12} className="text-gray-400" />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonialsData.map((t, i) => {
            const year = getYear(t.created_at);
            const flagDisplay: string = typeof t.country === 'string' ? t.country : '';
            const degree: string = t.course || t.degree || '';
            const university: string = t.university || '';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group transition-all hover:-translate-y-1 hover:shadow-md flex flex-col"
              >
                <div className="absolute top-6 right-6 opacity-10 text-brand group-hover:opacity-20 transition-opacity">
                  <Quote size={48} />
                </div>

                {/* Country flag + Year badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold">
                    {flagDisplay}
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{year}</span>
                </div>

                {/* 5-star rating */}
                <div className="flex gap-1 mb-4 text-[#FFB800]">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className="text-[13px] text-gray-700 leading-relaxed mb-6 flex-1 italic">
                  "{t.body}"
                </p>

                {/* Author block */}
                <div className="border-t border-gray-100 pt-5 flex items-center gap-4 mt-auto">
                  {t.photo ? (
                    <img
                      src={resolveMediaUrl(t.photo)}
                      alt={t.name || "Student"}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.name ? t.name.charAt(0) : "S"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-black truncate">{t.name || "Transit Student"}</h4>
                    {(degree || university) && (
                      <p className="text-xs text-gray-500 truncate">
                        {[degree, university].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
