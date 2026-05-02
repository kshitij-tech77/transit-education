"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionLabel from "@/components/shared/SectionLabel";
import { CheckCircle2, MapPin, Award, Settings } from "lucide-react";

export default function WhyTransit() {
  return (
    <section className="py-20 bg-off-white border-t border-gray-100">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <SectionLabel>Why Us</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black">
            Why Nepali Students Choose <span className="text-brand">Transit</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-50"
          >
            <div className="flex-shrink-0">
              <Award className="w-10 h-10 text-brand" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">ICEF Accredited</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We are a verified international member and certified consultancy, ensuring the highest standards of service and integrity.
              </p>
              <Link href="#" className="text-brand text-sm font-semibold hover:underline">
                View Agency Recognition →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="flex gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-50"
          >
            <div className="flex-shrink-0">
              <MapPin className="w-10 h-10 text-brand" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">4 Branches Across Nepal</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Kathmandu (HQ), Itahari, Damak, and Damauli. Find expert counsellors closer to your home.
              </p>
              <Link href="/locations" className="text-brand text-sm font-semibold hover:underline">
                Find a Branch →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-50"
          >
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-10 h-10 text-brand" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">500+ Visas Granted</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Since 2015, we've successfully helped hundreds of students achieve their study abroad dreams with real outcomes, not just claims.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="flex gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-50"
          >
            <div className="flex-shrink-0">
              <Settings className="w-10 h-10 text-brand" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">End-to-end Service</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From admissions and SOP guidance to visa filing, IELTS/PTE prep, and pre-departure briefings — all managed in-house.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
