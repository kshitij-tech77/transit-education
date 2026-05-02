"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import teamData from "@/data/team.json";

export default function TeamTeaser() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Our Team</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black">Meet the Counsellors</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <Link href="/team" className="text-brand font-semibold hover:text-brand-dark transition-colors">
              View full team →
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamData.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                {/* Placeholder for image */}
                <div className="absolute inset-0 bg-gray-200 transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="font-bold text-lg mb-1 relative inline-block">
                {member.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full"></span>
              </h3>
              <p className="text-gray-600 text-sm">{member.role}</p>
              <p className="text-brand text-xs font-medium uppercase tracking-wider mt-2">{member.branch}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
