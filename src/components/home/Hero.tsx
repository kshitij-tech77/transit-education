"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/media-url";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, ArrowUpRight, Globe2, Sparkles, Loader2, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import useEmblaCarousel from 'embla-carousel-react';
import "flag-icons/css/flag-icons.min.css";

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

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return countryCode;
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const [settings, setSettings] = useState<any>(null);
  
  const fetchData = async () => {
    try {
      const [storiesRes, countriesRes, settingsRes] = await Promise.all([
        fetch('/api/cms/success-stories'),
        fetch('/api/cms/countries'),
        fetch('/api/cms/settings')
      ]);
      
      if (!storiesRes.ok) console.error('Failed to fetch stories');
      if (!countriesRes.ok) console.error('Failed to fetch countries');
      if (!settingsRes.ok) console.error('Failed to fetch settings');

      const stories = storiesRes.ok ? await storiesRes.json() : [];
      const countries = countriesRes.ok ? await countriesRes.json() : [];
      const settingsData = settingsRes.ok ? await settingsRes.json() : null;
      
      const mappedCountries = countries.map((c: any) => {
        const flagCode = (c.flag || c.code || '').trim();
        return {
          ...c,
          flag: flagCode.length === 2 ? getFlagEmoji(flagCode) : flagCode
        };
      });

      setSuccessStories(stories.slice(0, 6));
      setLiveCountries(mappedCountries.filter((c: any) => c.status === 'LIVE'));
      setSettings(settingsData);
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
      <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FAFAF8]">
        <div className="container relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="w-48 h-8 bg-gray-200 animate-pulse rounded-full mb-10" />
            <div className="w-full h-32 bg-gray-200 animate-pulse rounded-2xl mb-8" />
            <div className="w-3/4 h-8 bg-gray-200 animate-pulse rounded-lg mb-12" />
            <div className="flex gap-5">
              <div className="w-48 h-16 bg-gray-200 animate-pulse rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="w-full h-[400px] bg-gray-200 animate-pulse rounded-[40px]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-x-hidden bg-[#FAFAF8]">
      {/* ─── PREMIUM SUBTLE BACKGROUND ─── */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] -right-20 lg:right-[-5%] w-[500px] lg:w-[800px] h-[500px] lg:h-[800px] bg-[#A93226] rounded-full blur-[100px] lg:blur-[150px] pointer-events-none opacity-10" 
        />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="container px-4 relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center overflow-x-hidden">
        {/* ─── LEFT CONTENT ─── */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
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
            className="text-4xl sm:text-5xl lg:text-[clamp(48px,6.5vw,90px)] font-black leading-[1.15] lg:leading-[0.98] mb-8 tracking-[-0.04em] text-[#A93226] max-w-full break-words"
          >
            Dream. Apply.<br />
            <span className="text-[#111111]">Fly.</span>
          </motion.h1>
          
          <motion.p className="text-gray-600 text-lg lg:text-xl max-w-[580px] mb-12 leading-relaxed">
            {settings?.tagline || "Expert visa guidance for Canada, Australia, UK, USA & Europe. 4 branches across Nepal."}
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/contact" className={buttonVariants({ variant: "brand", size: "lg", className: "h-14 sm:h-16 px-8 sm:px-12 rounded-xl sm:rounded-2xl w-full sm:w-auto" })}>
              Book Free Consultation
            </Link>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-center lg:items-start gap-8">
            <div className="flex -space-x-4">
              {[10, 20, 32, 45].map(id => (
                <div key={id} className="w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shadow-lg relative bg-gray-100">
                   <Image src={`https://i.pravatar.cc/100?u=${id}`} alt="Student" fill sizes="56px" className="object-cover" />
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-[3px] border-white bg-[#A93226] flex items-center justify-center text-[13px] font-black text-white shadow-lg z-10">+2k</div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-black text-[#111111]">2,000+ Success Stories</p>
              <p className="text-[10px] text-[#A93226] uppercase tracking-[0.2em] font-bold mt-2">Certified Education Gateway</p>
            </div>
          </div>
        </div>
        
        {/* ─── RIGHT CONTENT ─── */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-10">
          {successStories.length > 0 && (
            <motion.div className="bg-[#A93226]/95 backdrop-blur-md border border-white/10 rounded-[2rem] lg:rounded-[40px] p-6 lg:p-8 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div><h3 className="text-white font-black text-2xl tracking-tight">Visa Success</h3><p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.2em]">Latest Approvals</p></div>
                <div className="flex gap-3">
                  <button onClick={prev} className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronLeft size={22} /></button>
                  <button onClick={next} className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronRight size={22} /></button>
                </div>
              </div>
              <div className="relative h-[480px] rounded-[35px] overflow-hidden shadow-2xl bg-gray-900 group">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={current} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0"
                  >
                    {successStories[current].approvalImage ? (
                      <>
                        <Image
                          src={resolveMediaUrl(successStories[current].approvalImage)}
                          alt={successStories[current].name}
                          fill
                          className="object-contain"
                          priority
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-5">
                          <h4 className="text-white text-xl font-black">{successStories[current].name}</h4>
                          <p className="text-white/70 text-sm">{successStories[current].university}</p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-brand/20 text-white p-12 text-center">
                        <span className="text-8xl mb-6">{successStories[current].flag}</span>
                        <h4 className="text-3xl font-black">{successStories[current].name}</h4>
                        <p className="opacity-60">{successStories[current].university}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* COUNTRY CAROUSEL */}
          <div className="relative hidden lg:block">
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
                  <div key={c.id} className="flex-[0_0_160px] md:flex-[0_0_200px] min-w-0">
                    <Link href={`/study-abroad/${c.code.toLowerCase()}`}>
                      <div className="bg-white p-7 rounded-[2.5rem] shadow-sm flex flex-col items-start gap-8 border border-gray-100 group transition-all hover:shadow-xl hover:shadow-[#A93226]/5 hover:-translate-y-1">
                        <div className="flex justify-between items-center w-full">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                            <span className={`fi fi-${c.code.toLowerCase()} text-3xl shadow-sm rounded-sm`} />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-[#A93226]/5 flex items-center justify-center text-[#A93226] group-hover:bg-[#A93226] group-hover:text-white transition-all">
                            <ArrowUpRight size={20} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-xl text-black group-hover:text-[#A93226] transition-colors mb-1">
                            {c.name}
                          </h4>
                          <span className="text-[10px] text-[#A93226] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                            View Details
                          </span>
                        </div>
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
