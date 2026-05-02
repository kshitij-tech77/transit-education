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
            <SectionLabel>About Us</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-6">Welcome to Transit Education</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              As one of Nepal's most trusted educational consultancies, we are dedicated to helping ambitious students pursue higher education abroad. Since 2015, we've provided honest, transparent, and expert guidance to ensure your transition to a global destination is seamless and successful. Your global future starts here.
            </p>
            <Link href="/about" className={buttonVariants({ className: "bg-brand text-white hover:bg-brand-dark px-8" })}>
              Know More →
            </Link>
          </motion.div>

          <div className="grid gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6"
            >
              <div className="text-4xl font-extrabold text-brand w-24">
                <Counter from={0} to={50} duration={2} suffix="+" />
              </div>
              <div className="text-gray-800 font-medium">Institutions Worldwide</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6"
            >
              <div className="text-4xl font-extrabold text-brand w-24">
                <Counter from={0} to={95} duration={2} suffix="%" />
              </div>
              <div className="text-gray-800 font-medium">Satisfied Clients</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6"
            >
              <div className="text-4xl font-extrabold text-brand w-24">
                <Counter from={0} to={2000} duration={2.5} suffix="+" />
              </div>
              <div className="text-gray-800 font-medium">Students Placed</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
