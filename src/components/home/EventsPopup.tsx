"use client";

import { useState, useEffect } from "react";
import { X, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
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

export default function EventsPopup({ events }: { events: Event[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (events.length === 0) return;
    const dismissed = sessionStorage.getItem("events_popup_dismissed");
    if (!dismissed) setOpen(true);
  }, [events.length]);

  const dismiss = () => {
    sessionStorage.setItem("events_popup_dismissed", "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-brand px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[#f9b8b3] text-[10px] font-bold uppercase tracking-widest">Don't Miss Out</p>
            <h2 className="text-white text-lg font-extrabold">Upcoming Events & Webinars</h2>
          </div>
          <button
            onClick={dismiss}
            className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {events.map(event => {
            const date = new Date(event.event_date);
            const day = date.toLocaleDateString("en-US", { day: "2-digit" });
            const month = date.toLocaleDateString("en-US", { month: "short" });
            const year = date.toLocaleDateString("en-US", { year: "numeric" });
            const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={event.id} className="bg-off-white rounded-xl p-4 border border-gray-100">
                {event.banner_image && (
                  <img
                    src={proxiedMediaUrl(event.banner_image)}
                    alt={event.title}
                    className="w-full h-28 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="flex gap-3 items-start">
                  <div className="bg-brand text-white rounded-xl p-2.5 text-center min-w-[48px] shrink-0">
                    <span className="text-lg font-black block leading-none">{day}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest block mt-0.5">{month}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium">{year} · {time}</p>
                    <h3 className="font-bold text-black text-sm mt-0.5 leading-snug">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} /> {event.location || "Online"}
                      </span>
                      {event.registration_link ? (
                        <a
                          href={event.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-brand hover:gap-1.5 transition-all"
                          onClick={dismiss}
                        >
                          Register <ArrowRight size={11} />
                        </a>
                      ) : (
                        <Link
                          href="/contact"
                          className="flex items-center gap-1 text-xs font-bold text-brand hover:gap-1.5 transition-all"
                          onClick={dismiss}
                        >
                          Enquire <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 pb-4 flex justify-end">
          <button
            onClick={dismiss}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
