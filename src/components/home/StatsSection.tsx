"use client";

import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Users, GraduationCap, Globe2, Award, Building2 } from "lucide-react";

interface StatItemProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  delay?: number;
}

function Counter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalMiliseconds = duration * 1000;
      const incrementTime = totalMiliseconds / end;

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

function StatItem({ label, value, suffix, icon, delay = 0 }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center p-8 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-brand/5 transition-all group"
    >
      <div className="w-16 h-16 bg-brand/5 rounded-2xl flex items-center justify-center text-brand mb-6 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div className="text-4xl lg:text-5xl font-black text-black mb-2 tracking-tight">
        <Counter value={value} suffix={suffix} />
      </div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{label}</p>
    </motion.div>
  );
}

export default function StatsSection({ stats }: { stats?: any }) {
  const defaultStats = [
    { label: "Years of Experience", value: 10, suffix: "+", icon: <Award size={32} /> },
    { label: "Students Helped", value: 5000, suffix: "+", icon: <Users size={32} /> },
    { label: "Visa Approval Rate", value: 99, suffix: "%", icon: <GraduationCap size={32} /> },
    { label: "University Partners", value: 300, suffix: "+", icon: <Building2 size={32} /> },
    { label: "Countries Covered", value: 15, suffix: "+", icon: <Globe2 size={32} /> },
  ];

  const displayStats = stats ? [
    { label: "Years of Experience", value: stats.years_experience || 10, suffix: "+", icon: <Award size={32} /> },
    { label: "Students Helped", value: stats.students_helped || 5000, suffix: "+", icon: <Users size={32} /> },
    { label: "Visa Approval Rate", value: stats.visa_success_rate || 99, suffix: "%", icon: <GraduationCap size={32} /> },
    { label: "University Partners", value: stats.university_partners || 300, suffix: "+", icon: <Building2 size={32} /> },
    { label: "Countries Covered", value: stats.countries_covered || 15, suffix: "+", icon: <Globe2 size={32} /> },
  ] : defaultStats;

  return (
    <section className="py-24 bg-[#FAFAF8] relative overflow-hidden">
      <div className="container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {displayStats.map((stat, i) => (
            <div key={i} className={i === 4 ? "col-span-2 lg:col-span-1" : ""}>
              <StatItem {...stat} delay={i * 0.1} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </section>
  );
}
