"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { proxiedMediaUrl } from "@/lib/media-url";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, ArrowUpRight, Globe2, Sparkles, Loader2, ShieldCheck, Star, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import useEmblaCarousel from 'embla-carousel-react';
import "flag-icons/css/flag-icons.min.css";

/* Fix #2 — map ISO 2-letter codes → URL slugs */
const CODE_TO_SLUG: Record<string, string> = {
  au: "australia",
  ca: "canada",
  gb: "uk",
  us: "usa",
  nz: "new-zealand",
  kr: "south-korea",
  it: "italy",
  ie: "ireland",
  de: "germany",
  jp: "japan",
  fr: "france",
};

function getSlug(code: string): string {
  return CODE_TO_SLUG[code.toLowerCase()] ?? code.toLowerCase();
}

interface HeroProps {
  initialSuccessStories?: any[];
  initialCountries?: any[];
  initialSettings?: any;
}

export default function Hero({ initialSuccessStories, initialCountries, initialSettings }: HeroProps = {}) {
  const [current, setCurrent] = useState(0);
  const [successStories, setSuccessStories] = useState<any[]>(initialSuccessStories ?? []);
  const [liveCountries, setLiveCountries] = useState<any[]>(initialCountries ?? []);
  const [settings, setSettings] = useState<any>(initialSettings ?? null);
  const [loading, setLoading] = useState(!initialSuccessStories);

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

  const fetchData = async () => {
    try {
      const [storiesRes, countriesRes, settingsRes] = await Promise.all([
        fetch('/api/cms/success-stories'),
        fetch('/api/cms/countries'),
        fetch('/api/cms/settings')
      ]);

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
    if (initialSuccessStories) return;
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-off-white">
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
    /* Fix #7 — overflow-hidden contains the blur orb inside this section */
    <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-off-white">
      {/* Background — contained within this section only */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] -right-20 lg:right-[-5%] w-[500px] lg:w-[800px] h-[500px] lg:h-[800px] bg-brand rounded-full blur-[120px] lg:blur-[160px] pointer-events-none opacity-10"
        />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('/noise.svg')]" />
      </div>

      <div className="container px-4 relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* ─── LEFT CONTENT ─── */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E4E0] text-[12px] font-semibold mt-6 lg:mt-0 mb-10 shadow-sm text-[#6B6966]"
          >
            <Sparkles size={11} className="text-brand" />
            ICEF Accredited Agency · Est. 2015
          </motion.div>

          {/* Fix #6 — clamp font-size scales down to 320px without clipping */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-black leading-[1.1] mb-8 tracking-[-0.02em] text-brand max-w-full"
            style={{
              fontSize: "clamp(28px, 9vw, clamp(36px, 5.5vw, 80px))",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            Dream. Apply.<br />
            <span className="text-black">Fly.</span>
          </motion.h1>

          <motion.p className="text-[#6B6966] text-lg lg:text-xl max-w-145 mb-12 leading-relaxed">
            {settings?.tagline || "Expert visa guidance for Canada, Australia, UK, USA & Europe. 4 branches across Nepal."}
          </motion.p>

          {/* Fix #25 — CTA with → icon, hover lift, shadow */}
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 bg-brand text-white font-bold px-8 sm:px-12 h-14 sm:h-16 rounded-xl sm:rounded-2xl w-full sm:w-auto shadow-lg shadow-brand/25 hover:brightness-110 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand/30 transition-all duration-200 ease-in-out"
            >
              Book Free Consultation
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Urgency signal */}
          <p className="mt-3 text-[13px] text-[#6B6966] font-medium text-center sm:text-left px-4 sm:px-0">
            Join <span className="font-bold text-[#111111]">2,000+ students</span> who trusted Transit Education
          </p>

          {/* Fix #28 — ICEF + Google Reviews trust badges below CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-4 justify-center lg:justify-start px-4 sm:px-0">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm">
              <ShieldCheck size={16} className="text-brand shrink-0" />
              <span className="text-[12px] font-bold text-gray-700">ICEF Verified Agency</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[12px] font-bold text-gray-700">4.9 Google Reviews</span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center lg:items-start gap-8">
            <div className="flex -space-x-4">
              {[
                "https://res.cloudinary.com/xgpct4gs/image/upload/media/2025/02/testimonial4-free-img.jpg",
                "https://res.cloudinary.com/xgpct4gs/image/upload/media/2025/02/testimonial3-free-img.jpg",
                "https://res.cloudinary.com/xgpct4gs/image/upload/media/2023/05/Suraj-Photo.jpeg",
                "https://res.cloudinary.com/xgpct4gs/image/upload/media/2023/05/Photo-Nayesha.jpg",
                "https://res.cloudinary.com/xgpct4gs/image/upload/media/2023/05/311017882_1626736731054537_2485975926200975415_n-1.jpg",
              ].map((src, i) => (
                <div key={i} className="w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shadow-lg relative bg-gray-100">
                   <Image src={proxiedMediaUrl(src)} alt="Student" fill sizes="56px" className="object-cover" />
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-[3px] border-white bg-brand flex items-center justify-center text-[13px] font-black text-white shadow-lg z-10">+2k</div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-black text-[#111111]">2,000+ Success Stories</p>
              <p className="text-[10px] text-brand uppercase tracking-[0.2em] font-bold mt-2">Certified Education Gateway</p>
            </div>
          </div>
        </div>

        {/* ─── RIGHT CONTENT ─── */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-10">
          {successStories.length > 0 && (
            <motion.div className="bg-brand/95 backdrop-blur-md border border-white/10 rounded-[2rem] lg:rounded-[40px] p-6 lg:p-8 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div><p className="text-white font-black text-2xl tracking-tight">Visa Success</p><p className="text-white/75 text-[11px] font-bold uppercase tracking-[0.2em]">Latest Approvals</p></div>
                <div className="flex gap-3">
                  <button onClick={prev} aria-label="Previous story" className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronLeft size={22} /></button>
                  <button onClick={next} aria-label="Next story" className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronRight size={22} /></button>
                </div>
              </div>
              <div className="relative h-120 rounded-[35px] overflow-hidden shadow-2xl bg-gray-900 group">
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
                          src={proxiedMediaUrl(successStories[current].approvalImage)}
                          alt={successStories[current].name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-contain"
                          priority
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-6 py-5">
                          <p className="text-white text-xl font-black">{successStories[current].name}</p>
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

          {/* Fix #2 — country carousel uses getSlug() for href, c.code for flag icon */}
          <div className="relative hidden lg:block">
            <div className="flex justify-between items-center mb-5 px-3">
               <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center gap-2"><Globe2 size={14} /> Live Countries</h4>
               <div className="flex gap-2">
                 <button onClick={scrollPrev} aria-label="Previous destination" className="text-gray-300 hover:text-brand p-1"><ChevronLeft size={20} /></button>
                 <button onClick={scrollNext} aria-label="Next destination" className="text-gray-300 hover:text-brand p-1"><ChevronRight size={20} /></button>
               </div>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-5">
                {liveCountries.map((c) => {
                  const isoCode = (c.flag && typeof c.flag === 'string' && c.flag.length === 2)
                    ? c.flag
                    : c.code?.toLowerCase() ?? '';
                  const slug = getSlug(c.code?.toLowerCase() ?? '');
                  return (
                    <div key={c.id} className="flex-[0_0_160px] md:flex-[0_0_200px] min-w-0">
                      <Link href={`/study-abroad/${slug}`}>
                        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm flex flex-col items-start gap-8 border border-gray-100 group transition-all hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 cursor-pointer">
                          <div className="flex justify-between items-center w-full">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                              <span className={`fi fi-${isoCode} text-3xl shadow-sm rounded-sm`} />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all">
                              <ArrowUpRight size={20} />
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-xl text-black group-hover:text-brand transition-colors mb-1">
                              {c.name}
                            </p>
                            <span className="text-[10px] text-brand font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                              View Details
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
