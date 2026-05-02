"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import successStoriesData from "@/data/successStories.json";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SuccessStories() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-20 bg-brand text-white overflow-hidden">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="text-white/80 font-bold text-sm tracking-widest uppercase mb-4">
              Student Success
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Recent Visa Approvals</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex gap-2"
          >
            <button onClick={scrollPrev} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={scrollNext} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {successStoriesData.map((story, i) => (
              <div key={i} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0">
                <div className="bg-gradient-to-br from-gray-800 to-black p-1 rounded-2xl h-[400px] relative overflow-hidden group">
                  {/* Placeholder for visa approval image */}
                  <div className="absolute inset-0 bg-gray-900 transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {story.year}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="inline-flex items-center px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-semibold mb-3">
                      {story.country}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{story.name}</h3>
                    <p className="text-white/80 text-sm">{story.course}</p>
                    <p className="text-brand-light text-xs font-medium uppercase tracking-wider mt-2">{story.university}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
