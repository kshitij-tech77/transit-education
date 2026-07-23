"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import useEmblaCarousel from "embla-carousel-react";
import { proxiedMediaUrl } from "@/lib/media-url";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

/* Fix #27 — link each card to its destination page + hover lift */
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

function getSlug(countryId: string): string {
  if (!countryId) return "";
  const lower = countryId.toLowerCase().trim();
  return CODE_TO_SLUG[lower] ?? lower;
}

export default function SuccessStories({ stories }: { stories: any[] }) {
  const successStoriesData = stories || [];
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

        <div className="overflow-hidden px-4" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6">
            {successStoriesData.map((story, i) => {
              const slug = getSlug(story.country_id || "");
              const CardInner = (
                <div className="bg-linear-to-br from-gray-800 to-black p-1 rounded-2xl h-[400px] relative overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                    {story.approvalImage ? (
                      <img
                        src={proxiedMediaUrl(story.approvalImage)}
                        alt={story.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : null}
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

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
              );

              return (
                <div key={i} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 px-2">
                  {slug ? (
                    <Link href={`/study-abroad/${slug}`} aria-label={`Study in ${story.country}`}>
                      {CardInner}
                    </Link>
                  ) : (
                    CardInner
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
