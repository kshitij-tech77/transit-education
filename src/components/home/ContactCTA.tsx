"use client";

import { motion } from "framer-motion";
import LeadForm from "@/components/forms/LeadForm";
import { CheckCircle2 } from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="py-20 bg-brand-light">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-6 leading-tight">
              Ready to start your journey?
            </h2>
            <p className="text-gray-700 text-lg mb-8 max-w-120">
              Take the first step towards your global education dream. Book a free consultation with our expert counsellors today.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "100% Free Consultation",
                "ICEF Accredited Agency",
                "500+ Visas Granted Successfully",
                "4 Branches Across Nepal"
              ].map((perk, i) => (
                <li key={i} className="flex items-center gap-3 font-medium text-black">
                  <CheckCircle2 className="w-6 h-6 text-brand shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="bg-white p-8 md:p-10 rounded-2xl border border-[#E5E4E0] hover:shadow-lg transition-shadow"
          >
            <h3 className="text-2xl font-bold mb-6">Get your free profile review</h3>
            <LeadForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
