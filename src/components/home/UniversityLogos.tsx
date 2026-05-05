"use client";

import { motion } from "framer-motion";

export default function UniversityLogos({ universities = [] }: { universities?: any[] }) {
  const fallbackLogos = [
    { name: 'Toronto', logo: 'https://logo.clearbit.com/utoronto.ca' },
    { name: 'Melbourne', logo: 'https://logo.clearbit.com/unimelb.edu.au' },
    { name: 'Oxford', logo: 'https://logo.clearbit.com/ox.ac.uk' },
    { name: 'Harvard', logo: 'https://logo.clearbit.com/harvard.edu' },
    { name: 'UBC', logo: 'https://logo.clearbit.com/ubc.ca' },
    { name: 'Sydney', logo: 'https://logo.clearbit.com/sydney.edu.au' },
    { name: 'McGill', logo: 'https://logo.clearbit.com/mcgill.ca' },
    { name: 'Monash', logo: 'https://logo.clearbit.com/monash.edu' },
  ];

  const logos = universities.length > 0 ? universities : fallbackLogos;

  return (
    <section className="py-16 bg-white overflow-hidden border-b border-gray-100">
      <div className="container mb-10 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Our Global University Partners</p>
      </div>
      
      <div className="flex relative">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 items-center shrink-0 px-10"
        >
          {[...logos, ...logos, ...logos].map((u, i) => (
            <div key={i} className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 flex items-center gap-4">
              <img src={u.logo || u.logo_url} alt={u.name} className="h-10 w-auto object-contain" />
              <span className="text-gray-900 font-bold text-sm tracking-tight">{u.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
