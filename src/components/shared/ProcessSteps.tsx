"use client";

import { motion } from "framer-motion";
import { MessageSquare, ClipboardCheck, GraduationCap, FileText, Send } from "lucide-react";
import SectionLabel from "./SectionLabel";

const steps = [
  {
    title: "Free Consultation",
    description: "Meet our experts to discuss your goals, preferences, and study abroad dreams.",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Profile Assessment",
    description: "We evaluate your academic background and test scores to identify the best opportunities.",
    icon: <ClipboardCheck className="w-6 h-6" />,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "University Selection",
    description: "Choose from our 300+ partner universities across Canada, Australia, UK, and more.",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Documentation",
    description: "Step-by-step assistance with SOPs, LORs, and university application filing.",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "Visa & Departure",
    description: "Expert visa guidance and pre-departure briefing to ensure a smooth transition.",
    icon: <Send className="w-6 h-6" />,
    color: "bg-rose-50 text-rose-600"
  }
];

export default function ProcessSteps() {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="text-center mb-20">
          <SectionLabel>Our Process</SectionLabel>
          <h2 className="text-4xl font-black text-black mt-4">How It <span className="text-brand">Works</span></h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Your journey from Nepal to a global classroom, simplified into five clear steps.</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          
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
                <div className={`w-20 h-20 ${step.color} rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500 relative`}>
                  {step.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center border-4 border-white">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
