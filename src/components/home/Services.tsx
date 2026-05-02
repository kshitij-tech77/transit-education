"use client";

import { GraduationCap, FileCheck, BookOpen, Award, Compass, Plane } from "lucide-react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";

const services = [
  {
    title: "Admissions Guidance",
    icon: GraduationCap,
    desc: "We assist students to select the right study abroad program based on their interest and academic profile.",
  },
  {
    title: "Student Visa Support",
    icon: FileCheck,
    desc: "Step-by-step visa filing — document checklist, SOP, financials, biometrics — for every destination we cover.",
  },
  {
    title: "Test Preparation",
    icon: BookOpen,
    desc: "In-house IELTS and PTE preparation classes that help students achieve their best score in the tests they need.",
  },
  {
    title: "Financial Aid & Scholarships",
    icon: Award,
    desc: "We guide on financing options, including scholarships and grants, and helping clients navigate the financial aid process.",
  },
  {
    title: "Career Counselling",
    icon: Compass,
    desc: "Career counselling, resume writing, job-search strategies, and networking opportunities for students after admission.",
  },
  {
    title: "Pre-Departure Orientation",
    icon: Plane,
    desc: "Cultural adjustment, language brush-up, and safety tips before students fly out.",
  },
];

export default function Services() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <SectionLabel>Our Services</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black">How We Help You</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.05 }}
                className="bg-off-white p-8 rounded-xl border border-transparent transition-all hover:bg-white hover:border-brand hover:shadow-lg group"
              >
                <div className="w-11 h-11 bg-brand-light rounded-lg flex items-center justify-center mb-6 transition-colors group-hover:bg-brand">
                  <Icon className="w-6 h-6 text-brand group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-[17px] font-bold text-black mb-3">{service.title}</h3>
                <p className="text-[13px] font-light leading-relaxed text-gray-600">
                  {service.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
