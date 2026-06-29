"use client";

import { motion } from "framer-motion";
/* Fix #23 — replace multicolored icons with brand-consistent Lucide icons */
import { MessageSquare, ClipboardList, GraduationCap, FileText, Plane } from "lucide-react";
import SectionLabel from "./SectionLabel";

const steps = [
  {
    title: "Free Consultation",
    description: "Meet our experts to discuss your goals, preferences, and study abroad dreams.",
    icon: MessageSquare,
  },
  {
    title: "Profile Assessment",
    description: "We evaluate your academic background and test scores to identify the best opportunities.",
    icon: ClipboardList,
  },
  {
    title: "University Selection",
    description: "Choose from our 100+ partner universities across Canada, Australia, UK, and more.",
    icon: GraduationCap,
  },
  {
    title: "Documentation",
    description: "Step-by-step assistance with SOPs, LORs, and university application filing.",
    icon: FileText,
  },
  {
    title: "Visa & Departure",
    description: "Expert visa guidance and pre-departure briefing to ensure a smooth transition.",
    icon: Plane,
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <SectionLabel>Our Process</SectionLabel>
          <h2 className="text-4xl font-black text-black mt-4">How It <span className="text-brand">Works</span></h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Your journey from Nepal to a global classroom, simplified into five clear steps.</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-10 left-0 w-full h-0.5 bg-gray-100 z-0" />

          <div className="grid lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Icon — brand color, consistent size */}
                <div className="w-20 h-20 bg-brand/8 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand group-hover:shadow-lg group-hover:shadow-brand/20 transition-all duration-300 relative">
                  <step.icon className="w-7 h-7 text-brand group-hover:text-white transition-colors duration-300" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-black mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
