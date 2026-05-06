"use client";

import React from "react";

const universities = [
  { name: "University of British Columbia", domain: "ubc.ca" },
  { name: "University of Sydney", domain: "sydney.edu.au" },
  { name: "McGill University", domain: "mcgill.ca" },
  { name: "Monash University", domain: "monash.edu" },
  { name: "University of Toronto", domain: "utoronto.ca" },
  { name: "University of Melbourne", domain: "unimelb.edu.au" },
  { name: "University of Auckland", domain: "auckland.ac.nz" },
  { name: "Trinity College Dublin", domain: "tcd.ie" },
  { name: "University of Edinburgh", domain: "ed.ac.uk" },
  { name: "Seoul National University", domain: "snu.ac.kr" },
  { name: "TU Berlin", domain: "tu.berlin" },
];

export default function UniversityLogos() {
  // Triple the list for a seamless marquee effect
  const displayLogos = [...universities, ...universities, ...universities];

  return (
    <section className="py-20 bg-white overflow-hidden border-y border-slate-100">
      <div className="container mb-12 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Empowering Students at Global Institutions
        </p>
      </div>

      <div className="group relative flex w-full overflow-hidden">
        {/* Marquee Track */}
        <div className="flex animate-marquee whitespace-nowrap py-4 group-hover:[animation-play-state:paused]">
          {displayLogos.map((u, i) => (
            <div 
              key={i} 
              className="mx-6 md:mx-12 shrink-0 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            >
              <img 
                src={`https://logo.clearbit.com/${u.domain}`} 
                alt={u.name} 
                className="h-10 w-auto object-contain max-w-[160px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* Duplicate Track for Seamlessness */}
        <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-4 group-hover:[animation-play-state:paused]">
          {displayLogos.map((u, i) => (
            <div 
              key={`${i}-clone`} 
              className="mx-6 md:mx-12 shrink-0 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            >
              <img 
                src={`https://logo.clearbit.com/${u.domain}`} 
                alt={u.name} 
                className="h-10 w-auto object-contain max-w-[160px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
