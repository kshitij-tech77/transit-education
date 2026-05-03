"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, ArrowUpRight, Globe2, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import useEmblaCarousel from 'embla-carousel-react';

const successImages = [
  { 
    url: "/media-images/2021/04/Diwakar-visa-garnt.png", 
    name: "Diwakar S.", 
    country: "Canada",
    status: "Visa Granted"
  },
  { 
    url: "/media-images/2021/07/USA-Visa-grant-Roshan.png", 
    name: "Roshan K.", 
    country: "USA",
    status: "Visa Approved"
  },
  { 
    url: "/media-images/2021/07/USA-Visa-grant-Richa.png", 
    name: "Richa M.", 
    country: "USA",
    status: "Study Permit"
  },
  { 
    url: "/media-images/2025/02/Copy-of-Copy-of-USA-Visa-Grant.png", 
    name: "Pratik B.", 
    country: "USA",
    status: "Visa Success"
  },
];

const countries = [
  { name: "Australia", code: "AU", flag: "https://flagcdn.com/w80/au.png" },
  { name: "Canada", code: "CA", flag: "https://flagcdn.com/w80/ca.png" },
  { name: "United Kingdom", code: "GB", flag: "https://flagcdn.com/w80/gb.png" },
  { name: "USA", code: "US", flag: "https://flagcdn.com/w80/us.png" },
  { name: "Japan", code: "JP", flag: "https://flagcdn.com/w80/jp.png" },
  { name: "South Korea", code: "KR", flag: "https://flagcdn.com/w80/kr.png" },
  { name: "Germany", code: "DE", flag: "https://flagcdn.com/w80/de.png" },
  { name: "New Zealand", code: "NZ", flag: "https://flagcdn.com/w80/nz.png" },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % successImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % successImages.length);
  const prev = () => setCurrent((prev) => (prev - 1 + successImages.length) % successImages.length);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FAFAF8]">
      {/* ─── PREMIUM SUBTLE BACKGROUND ─── */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Mesh Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#A93226] rounded-full blur-[150px] pointer-events-none opacity-10" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-brand rounded-full blur-[120px] pointer-events-none opacity-10" 
        />
        
        {/* Very Faint Noise Texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="container relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* ─── LEFT CONTENT ─── */}
        <div className="lg:col-span-6 xl:col-span-7">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-gray-100 text-[11px] font-bold mb-10 uppercase tracking-[0.15em] shadow-sm text-gray-500"
          >
            <Sparkles size={12} className="text-[#A93226]" />
            ICEF Accredited Agency · Est. 2015
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(48px,6.5vw,90px)] font-black leading-[0.98] mb-8 tracking-[-0.04em] text-[#A93226]"
          >
            Your Transit to<br />
            <span className="text-[#111111]">Global Destinations</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg lg:text-xl max-w-[580px] mb-12 leading-relaxed font-normal tracking-tight"
          >
            Expert visa guidance for Canada, Australia, UK, USA & Europe. 4 branches across Nepal — Kathmandu, Itahari, Damak, Damauli.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-[#A93226] text-white hover:bg-[#8E241C] hover:scale-[1.03] active:scale-[0.98] font-black text-base h-16 px-12 rounded-2xl shadow-[0_20px_50px_rgba(169,50,38,0.2)] transition-all flex items-center justify-center" })}>
              Book Free Consultation
            </Link>
            <Link href="/locations" className={buttonVariants({ size: "lg", variant: "outline", className: "border-[#A93226]/30 text-[#A93226] hover:bg-[#A93226]/5 font-bold text-base h-16 px-10 rounded-2xl bg-white transition-all flex items-center justify-center" })}>
              Find Our Branches
            </Link>
          </motion.div>

          {/* Social Proof Stack (Enhanced with Real Authenticity) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8"
          >
            <div className="flex -space-x-4">
              {[10, 20, 32, 45].map(id => (
                <div key={id} className="w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shadow-lg relative">
                   <Image 
                     src={`https://i.pravatar.cc/100?u=${id}`}
                     alt="Successful Student"
                     fill
                     className="object-cover grayscale-[20%] hover:grayscale-0 transition-all"
                   />
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-[3px] border-white bg-[#A93226] flex items-center justify-center text-[13px] font-black text-white shadow-lg z-10">
                +2k
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-[#111111] tracking-tight leading-none">2,000+ Success Stories</p>
              <p className="text-[10px] text-[#A93226] uppercase tracking-[0.2em] font-bold mt-2 flex items-center gap-1.5">
                <Sparkles size={10} /> Certified Global Education Gateway
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* ─── RIGHT CONTENT ─── */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-10">
          {/* VISA SUCCESS SLIDER (Softer Red Look) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[#A93226]/95 backdrop-blur-md border border-white/10 rounded-[40px] p-8 relative overflow-hidden group shadow-[0_40px_100px_rgba(169,50,38,0.15)]"
          >
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div>
                <h3 className="text-white font-black text-2xl tracking-tight mb-1">Visa Success</h3>
                <p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.2em]">Latest Approvals</p>
              </div>
              <div className="flex gap-3">
                <button onClick={prev} className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                  <ChevronLeft size={22} />
                </button>
                <button onClick={next} className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>

            <div className="relative h-[360px] rounded-[30px] overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 30, scale: 1.05 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={successImages[current].url}
                    alt={successImages[current].name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-8 left-8 right-8">
                    <h4 className="text-white font-black text-3xl mb-1 tracking-tight">{successImages[current].name}</h4>
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin size={16} className="text-white/40" /> {successImages[current].country}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* SWIPEABLE COUNTRY CARDS */}
          <div className="relative">
            <div className="flex justify-between items-center mb-5 px-3">
               <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center gap-2">
                 <Globe2 size={14} className="opacity-50" /> Countries We Process
               </h4>
               <div className="flex gap-2">
                 <button onClick={scrollPrev} className="text-gray-300 hover:text-[#A93226] transition-colors cursor-pointer p-1"><ChevronLeft size={20} /></button>
                 <button onClick={scrollNext} className="text-gray-300 hover:text-[#A93226] transition-colors cursor-pointer p-1"><ChevronRight size={20} /></button>
               </div>
            </div>
            
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-5">
                {countries.map((c, i) => (
                  <div 
                    key={c.code}
                    className="flex-[0_0_190px] min-w-0"
                  >
                    <Link href={`/study-abroad/${c.name.toLowerCase().replace(' ', '-')}`}>
                      <motion.div 
                        whileHover={{ y: -8 }}
                        className="bg-white p-6 rounded-[28px] shadow-[0_15px_35px_rgba(0,0,0,0.05)] flex flex-col items-start gap-6 border border-gray-100/50 group transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center w-full relative z-10">
                          <div className="relative w-14 h-10 overflow-hidden rounded-md shadow-sm border border-gray-100">
                            <Image 
                              src={c.flag}
                              alt={c.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="w-9 h-9 rounded-full bg-[#A93226]/5 flex items-center justify-center text-[#A93226] group-hover:bg-[#A93226] group-hover:text-white transition-all">
                            <ArrowUpRight size={18} />
                          </div>
                        </div>
                        <div className="relative z-10">
                          <h4 className="font-black text-lg text-[#111111] group-hover:text-[#A93226] transition-colors tracking-tight leading-tight mb-1">{c.name}</h4>
                          <span className="text-[10px] text-[#A93226] font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100">View Details</span>
                        </div>
                        
                        {/* Subtle background accent on hover */}
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#A93226]/[0.02] rounded-full translate-x-12 translate-y-12 group-hover:scale-150 transition-transform duration-700" />
                      </motion.div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
