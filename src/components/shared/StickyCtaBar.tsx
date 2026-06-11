"use client";

import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface StickyCtaBarProps {
  phone?: string;
  whatsapp?: string;
}

export default function StickyCtaBar({ phone = "01-5906277", whatsapp = "9779851315991" }: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  return (
    <>
      {/* ── Mobile-only sticky CTA bar ── */}
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[9998] lg:hidden"
          >
            <div className="flex items-stretch h-14 shadow-2xl">
              <Link
                href="/contact"
                className="flex-1 bg-brand text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                Book Free Consultation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
                className="bg-brand/80 text-white px-3 border-l border-white/20 flex items-center justify-center hover:bg-brand/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desktop sticky announcement bar ── */}
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:block fixed bottom-0 left-0 right-0 z-[9998] bg-black text-white shadow-2xl border-t border-white/10"
          >
            <div className="container py-2.5 flex items-center gap-3 overflow-hidden">
              <div className="hidden xl:flex items-center gap-3 shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                  ICEF Accredited
                </span>
              </div>
              <p className="text-sm font-semibold text-white/90 whitespace-nowrap hidden md:block">
                Free profile evaluation — limited slots
              </p>
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  {phone}
                </a>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  WhatsApp
                </a>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 bg-brand hover:bg-brand/80 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  Free Consultation
                </Link>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-gray-500 hover:text-white transition-colors shrink-0 ml-2"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
