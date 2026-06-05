"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  event_date: string;
  description?: string;
  location?: string;
  registration_link?: string;
  banner_image?: string;
}

export default function UpcomingEvents({ events }: { events: Event[] }) {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Don't Miss Out</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black">Upcoming Events & Webinars</h2>
          </motion.div>
        </div>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-[#F7F3F3] rounded-2xl p-10 text-center border border-gray-100"
          >
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No upcoming events at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon — we regularly host webinars and info sessions.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, i) => {
              const date = new Date(event.event_date);
              const day = date.toLocaleDateString("en-US", { day: "2-digit" });
              const month = date.toLocaleDateString("en-US", { month: "short" });
              const year = date.toLocaleDateString("en-US", { year: "numeric" });
              const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#F7F3F3] rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  {event.banner_image && (
                    <img src={event.banner_image} alt={event.title} className="w-full h-36 object-cover rounded-xl mb-4" />
                  )}
                  <div className="flex gap-4 items-start mb-4">
                    <div className="bg-[#A93226] text-white rounded-xl p-3 text-center min-w-14 shrink-0">
                      <span className="text-xl font-black block leading-none">{day}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest block mt-1">{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{year} · {time}</p>
                      <h3 className="font-bold text-black text-base mt-1 leading-snug group-hover:text-[#A93226] transition-colors">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin size={12} /> {event.location || "Online"}
                    </span>
                    {event.registration_link ? (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-[#A93226] hover:gap-2 transition-all"
                      >
                        Register <ArrowRight size={12} />
                      </a>
                    ) : (
                      <Link href="/contact" className="flex items-center gap-1 text-xs font-bold text-[#A93226] hover:gap-2 transition-all">
                        Enquire <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
