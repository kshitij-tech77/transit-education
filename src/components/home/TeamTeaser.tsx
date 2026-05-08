"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import { resolveMediaUrl } from "@/lib/media-url";

export default function TeamTeaser({ members }: { members: any[] }) {
  const teamData = members || [];
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
              className="group"
            >
              <div className="relative aspect-[4/5] mb-6 overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-brand/10 group-hover:-translate-y-2">
                <img
                  src={resolveMediaUrl(member.photo)}
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                   <p className="text-white text-sm font-medium">Expert Advisor</p>
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-black mb-1 transition-colors group-hover:text-brand">
                  {member.name}
                </h3>
                <p className="text-gray-500 font-medium text-sm mb-2">{member.role}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                  {member.branch}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
