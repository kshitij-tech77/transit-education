"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { STATS } from "@/constants/stats";

function Counter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;
    let start = 0;
    setCount(0);
    const totalMs = duration * 1000;
    const stepMs = Math.max(10, totalMs / value);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= value) clearInterval(timer);
    }, stepMs);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

export default function StatsSection({ stats }: { stats?: any }) {
  const displayStats: Stat[] = [
    { label: "Years of excellence", value: stats?.years_experience ?? STATS.yearsExperience, suffix: "+" },
    { label: "Students helped", value: stats?.students_helped ?? STATS.studentsHelped, suffix: "+" },
    { label: "University partners", value: stats?.university_partners ?? STATS.universityPartners, suffix: "+" },
    { label: "Countries covered", value: stats?.countries_covered ?? STATS.countriesCovered, suffix: "+" },
    { label: "Branch offices", value: stats?.branches ?? STATS.branches },
  ];

  return (
    <section className="py-20 bg-off-white border-y border-[#E5E4E0]">
      <div className="container">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-[#E5E4E0]">
          {displayStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`flex flex-col px-6 py-4 ${i === 0 ? "pl-0" : ""} ${i === displayStats.length - 1 ? "pr-0" : ""} ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <span className="text-[clamp(2rem,4vw,3rem)] font-black text-black leading-none tracking-tight mb-2">
                <Counter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-[13px] text-[#6B6966] font-medium leading-snug">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
