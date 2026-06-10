"use client";

import { useState, useEffect } from "react";
import { X, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface StickyCtaBarProps {
  phone?: string;
  whatsapp?: string;
}

export default function StickyCtaBar({
  phone = "01-5906277",
  whatsapp = "9779851315991",
}: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  const waMessage = encodeURIComponent("Hi! I'd like a free consultation about studying abroad.");

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[9998] bg-black text-white shadow-2xl border-t border-white/10"
        >
          <div className="container py-3 flex items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                ICEF Accredited Consultancy
              </span>
            </div>

            <p className="text-sm font-semibold text-white/90 hidden sm:block">
              Book your free profile evaluation today — limited slots available
            </p>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{phone}</span>
                <span className="sm:hidden">Call</span>
              </a>

              <a
                href={`https://wa.me/${whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
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
  );
}
