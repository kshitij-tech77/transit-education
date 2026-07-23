"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Bell, Send, Loader2 } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";
import { toast } from "sonner";
import { proxiedMediaUrl } from "@/lib/media-url";

interface Event {
  id: string;
  title: string;
  event_date: string;
  description?: string;
  location?: string;
  registration_link?: string;
  banner_image?: string;
}

/* Fix #17 — newsletter CTA when no upcoming events; hide section header too */
function EventNewsletterCTA() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <Bell className="w-8 h-8 text-brand" />
          </div>
          <SectionLabel className="mx-auto">Events & Webinars</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4 mb-4">
            Be notified when we host events
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            No upcoming events right now, but we regularly host visa info sessions, scholarship webinars, and university fair days. Drop your email to be the first to know.
          </p>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 text-green-800 font-semibold"
            >
              You're subscribed! We'll notify you when we host our next event.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-brand text-white font-bold px-6 py-3.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-60 shrink-0"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Notify Me
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default function UpcomingEvents({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return <EventNewsletterCTA />;
  }

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
                  <img src={proxiedMediaUrl(event.banner_image)} alt={event.title} className="w-full h-36 object-cover rounded-xl mb-4" />
                )}
                <div className="flex gap-4 items-start mb-4">
                  <div className="bg-brand text-white rounded-xl p-3 text-center min-w-14 shrink-0">
                    <span className="text-xl font-black block leading-none">{day}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest block mt-1">{month}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium">{year} · {time}</p>
                    <h3 className="font-bold text-black text-base mt-1 leading-snug group-hover:text-brand transition-colors">
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
                      className="flex items-center gap-1 text-xs font-bold text-brand hover:gap-2 transition-all"
                    >
                      Register <ArrowRight size={12} />
                    </a>
                  ) : (
                    <Link href="/contact" className="flex items-center gap-1 text-xs font-bold text-brand hover:gap-2 transition-all">
                      Enquire <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
