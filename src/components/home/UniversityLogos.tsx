"use client";

import React from "react";
import { proxiedMediaUrl } from "@/lib/media-url";

const BASE = "https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media";

/* Fix #4 — removed slot where Transit Education logo was used as a placeholder */
const logos = [
  { src: `${BASE}/2023/05/Untitled-design-6.png`,  alt: "Partner University" },
  { src: `${BASE}/2023/05/Untitled-design-8.png`,  alt: "Partner University" },
  { src: `${BASE}/2023/05/Untitled-design-16.png`, alt: "Partner University" },
  { src: `${BASE}/2021/07/images-1.png`,            alt: "Partner University" },
  { src: `${BASE}/2021/07/images-1.jpg`,            alt: "Partner University" },
];

export default function UniversityLogos() {
  const displayLogos = [...logos, ...logos, ...logos];

  return (
    <section className="hidden md:block py-16 bg-slate-50 overflow-hidden border-y border-slate-100">
      <div className="container mb-10 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Empowering Students at Global Institutions
        </p>
      </div>

      {/* Fade edges */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-linear-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-linear-to-l from-slate-50 to-transparent" />

        <div className="group flex w-full overflow-hidden">
          {/* Marquee Track */}
          <div className="flex animate-marquee whitespace-nowrap py-3 group-hover:paused">
            {displayLogos.map((logo, i) => (
              <div
                key={i}
                className="mx-8 shrink-0 flex items-center justify-center opacity-75 hover:opacity-100 transition-all duration-500"
              >
                <img
                  src={proxiedMediaUrl(logo.src)}
                  alt={logo.alt}
                  className="h-14 w-auto object-contain max-w-45 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>

          {/* Duplicate Track for seamless loop */}
          <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-3 group-hover:paused">
            {displayLogos.map((logo, i) => (
              <div
                key={`clone-${i}`}
                className="mx-8 shrink-0 flex items-center justify-center opacity-75 hover:opacity-100 transition-all duration-500"
              >
                <img
                  src={proxiedMediaUrl(logo.src)}
                  alt={logo.alt}
                  className="h-14 w-auto object-contain max-w-45 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
