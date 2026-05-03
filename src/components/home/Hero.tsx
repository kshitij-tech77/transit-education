"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, ArrowUpRight, Globe2, Sparkles, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import useEmblaCarousel from 'embla-carousel-react';

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [liveCountries, setLiveCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const fetchData = async () => {
    try {
      const [storiesRes, countriesRes] = await Promise.all([
        fetch('/api/cms/success-stories'),
        fetch('/api/cms/countries')
      ]);
      const stories = await storiesRes.json();
      const countries = await countriesRes.json();
      
      setSuccessStories(stories.slice(0, 6)); // Latest 6
      setLiveCountries(countries.filter((c: any) => c.status === 'LIVE'));
    } catch (error) {
      console.error("Failed to fetch hero data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successStories.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % successStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [successStories]);

  const next = () => setCurrent((prev) => (prev + 1) % successStories.length);
  const prev = () => setCurrent((prev) => (prev - 1 + successStories.length) % successStories.length);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (loading) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="animate-spin text-[#A93226]" size={40} />
      </section>
    );
  }

  return (
    <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FAFAF8]">
      {/* ─── PREMIUM SUBTLE BACKGROUND ─── */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#A93226] rounded-full blur-[150px] pointer-events-none opacity-10" 
        />
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
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-[clamp(48px,6.5vw,90px)] font-black leading-[0.98] mb-8 tracking-[-0.04em] text-[#A93226]"
          >
            Your Transit to<br />
            <span className="text-[#111111]">Global Destinations</span>
          </motion.h1>
          
          <motion.p className="text-gray-600 text-lg lg:text-xl max-w-[580px] mb-12 leading-relaxed">
            Expert visa guidance for Canada, Australia, UK, USA & Europe. 4 branches across Nepal.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-5">
            <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-[#A93226] text-white hover:bg-[#8E241C] font-black text-base h-16 px-12 rounded-2xl shadow-xl transition-all" })}>
              Book Free Consultation
            </Link>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex -space-x-4">
              {[10, 20, 32, 45].map(id => (
                <div key={id} className="w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shadow-lg relative">
                   <Image src={`https://i.pravatar.cc/100?u=${id}`} alt="Student" fill sizes="56px" className="object-cover" />
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-[3px] border-white bg-[#A93226] flex items-center justify-center text-[13px] font-black text-white shadow-lg z-10">+2k</div>
            </div>
            <div>
              <p className="text-lg font-black text-[#111111]">2,000+ Success Stories</p>
              <p className="text-[10px] text-[#A93226] uppercase tracking-[0.2em] font-bold mt-2">Certified Education Gateway</p>
            </div>
          </div>
        </div>
        
        {/* ─── RIGHT CONTENT ─── */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-10">
          {successStories.length > 0 && (
            <motion.div className="bg-[#A93226]/95 backdrop-blur-md border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div><h3 className="text-white font-black text-2xl tracking-tight">Visa Success</h3><p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.2em]">Latest Approvals</p></div>
                <div className="flex gap-3">
                  <button onClick={prev} className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronLeft size={22} /></button>
                  <button onClick={next} className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronRight size={22} /></button>
                </div>
              </div>
              <div className="relative h-[360px] rounded-[30px] overflow-hidden shadow-2xl bg-black/10">
                <AnimatePresence mode="wait">
                  <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                    {/* Fallback to initials if no URL, but using placeholder for now */}
                    <div className="w-full h-full bg-[#A93226]/20 flex items-center justify-center text-white/20 text-6xl font-black">{successStories[current].flag}</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <h4 className="font-black text-3xl mb-1">{successStories[current].name}</h4>
                      <p className="text-sm font-medium opacity-80 flex items-center gap-1.5"><MapPin size={16} /> {successStories[current].country}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* COUNTRY CAROUSEL */}
          <div className="relative">
            <div className="flex justify-between items-center mb-5 px-3">
               <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center gap-2"><Globe2 size={14} /> Live Countries</h4>
               <div className="flex gap-2">
                 <button onClick={scrollPrev} className="text-gray-300 hover:text-[#A93226] p-1"><ChevronLeft size={20} /></button>
                 <button onClick={scrollNext} className="text-gray-300 hover:text-[#A93226] p-1"><ChevronRight size={20} /></button>
               </div>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-5">
                {liveCountries.map((c) => (
                  <div key={c.id} className="flex-[0_0_190px] min-w-0">
                    <Link href={`/study-abroad/${c.id}`}>
                      <div className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-start gap-6 border border-gray-100 group transition-all">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-3xl">{c.flag}</div>
                          <div className="w-9 h-9 rounded-full bg-[#A93226]/5 flex items-center justify-center text-[#A93226] group-hover:bg-[#A93226] group-hover:text-white transition-all"><ArrowUpRight size={18} /></div>
                        </div>
                        <div><h4 className="font-black text-lg text-[#111] group-hover:text-[#A93226] transition-colors">{c.name}</h4><span className="text-[10px] text-[#A93226] font-bold uppercase tracking-widest">View Details</span></div>
                      </div>
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
