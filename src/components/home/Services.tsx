"use client";

import { GraduationCap, FileCheck, BookOpen, Award, Compass, Plane } from "lucide-react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";

const services = [
  {
    title: "Admissions Guidance",
    icon: GraduationCap,
    desc: "We assist students to select the right study abroad program based on their interest and academic profile.",
    href: "/services/admission-counselling",
  },
  {
    title: "Student Visa Support",
    icon: FileCheck,
    desc: "Step-by-step visa filing — document checklist, SOP, financials, biometrics — for every destination we cover.",
    href: "/services/student-visa-service",
  },
  {
    title: "Test Preparation",
    icon: BookOpen,
    desc: "In-house IELTS and PTE preparation classes that help students achieve their best score in the tests they need.",
    href: "/services/test-preparation",
  },
  {
    title: "Financial Aid & Scholarships",
    icon: Award,
    desc: "We guide on financing options, including scholarships and grants, and help clients navigate the financial aid process.",
    href: "/services/scholarships-assistance",
  },
  {
    title: "Career Counselling",
    icon: Compass,
    desc: "Career counselling, resume writing, job-search strategies, and networking opportunities for students after admission.",
    href: "/services",
  },
  {
    title: "Pre-Departure Orientation",
    icon: Plane,
    desc: "Cultural adjustment, language brush-up, and safety tips before students fly out.",
    href: "/services",
  },
];

export default function Services() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          {/* Left — sticky label + intro */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <SectionLabel>What we do</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black leading-tight mb-6">
              Everything you need,<br />under one roof
            </h2>
            <p className="text-[#6B6966] text-[15px] leading-relaxed max-w-sm">
              From choosing the right university to landing your first flight — we handle every step so you can focus on what matters.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 mt-8 text-brand font-semibold text-sm hover:gap-3 transition-all"
            >
              View all services
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </motion.div>

          {/* Right — service rows */}
          <div className="divide-y divide-[#E5E4E0]">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="group py-7 flex items-start gap-5 cursor-default"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-surface flex items-center justify-center shrink-0 mt-0.5 transition-colors group-hover:bg-brand">
                    <Icon className="w-4.5 h-4.5 text-brand transition-colors group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-bold text-[#111111] mb-1.5 group-hover:text-brand transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[14px] text-[#6B6966] leading-relaxed">{service.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
