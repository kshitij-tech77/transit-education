"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { proxiedMediaUrl } from "@/lib/media-url";
import SectionLabel from "@/components/shared/SectionLabel";

interface CEOMessageProps {
  name?: string;
  title?: string;
  photoUrl?: string;
  message?: string;
}

export default function CEOMessage({ name, title, photoUrl, message }: CEOMessageProps) {
  if (!name && !message) return null;

  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--brand)_0%,_transparent_55%)] opacity-25" />
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          {/* Photo side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative">
              <div className="w-72 h-80 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-gray-800">
                {photoUrl ? (
                  <img
                    src={proxiedMediaUrl(photoUrl)}
                    alt={name || "CEO"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl font-black">
                    {(name || "C")[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-brand rounded-2xl flex items-center justify-center shadow-xl">
                <Quote size={32} className="text-white" />
              </div>
            </div>
          </motion.div>

          {/* Message side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel>Message from Our CEO</SectionLabel>
            <blockquote className="mt-6 text-gray-300 text-lg leading-relaxed italic">
              "{message || "At Transit Education, our mission has always been simple: open doors that once seemed closed. Every student who walks through our doors deserves world-class guidance, honest advice, and a team that genuinely believes in their future."}"
            </blockquote>
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white font-bold text-xl">{name || "CEO"}</p>
              <p className="text-brand font-semibold mt-1">{title || "CEO & Founder, Transit Education"}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
