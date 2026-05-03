"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import SectionLabel from "@/components/shared/SectionLabel";

function Counter({ from, to, duration, suffix = "" }: { from: number; to: number; duration: number; suffix?: string }) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * (to - from) + from));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, from, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function WelcomeAbout() {
  return (
    <section className="py-20 bg-off-white">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Welcome to Transit Education</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-8 leading-tight">
              Your Trusted Partner for <span className="text-brand">Global Education</span>
            </h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed mb-10">
              <p>
                Transit Education is a trusted educational consultancy dedicated to helping Nepalese students pursue higher education abroad. We provide comprehensive support for studying in Canada, the USA, the UK, Australia, New Zealand, Europe, and South Korea.
              </p>
              <p>
                Our services include university application assistance, visa processing, accommodation arrangements, and personalized counseling to help students choose the right courses and institutions based on their interests and career goals.
              </p>
              <p>
                With our expert guidance, students can navigate the study abroad process smoothly and confidently. We are committed to making international education accessible and ensuring a hassle-free experience for every student we assist.
              </p>
            </div>
            <Link href="/about" className={buttonVariants({ className: "bg-brand text-white hover:bg-brand-dark px-10 py-6 rounded-2xl text-lg shadow-lg shadow-brand/20 transition-all hover:scale-105" })}>
              Our Story →
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-center"
            >
              <div className="text-5xl font-black text-brand mb-2">
                <Counter from={0} to={500} duration={2} suffix="+" />
              </div>
              <div className="text-gray-500 font-semibold uppercase tracking-wider text-sm">Visas Granted</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="bg-black text-white p-8 rounded-3xl shadow-xl shadow-black/10 flex flex-col justify-center"
            >
              <div className="text-5xl font-black text-white mb-2">
                <Counter from={0} to={10} duration={2} suffix="+" />
              </div>
              <div className="text-gray-400 font-semibold uppercase tracking-wider text-sm">Years Excellence</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-center sm:col-span-2"
            >
              <div className="flex items-center gap-6">
                <div className="text-5xl font-black text-brand">
                  <Counter from={0} to={4} duration={1.5} />
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-xl leading-tight">Strategic Branches</div>
                  <div className="text-gray-500 text-sm">Kathmandu, Itahari, Damak, Damauli</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
