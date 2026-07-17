import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";

export const metadata: Metadata = {
  title: "Our Office Locations | 4 Branches Across Nepal",
  description: "Visit Transit Education at our 4 branches across Nepal — Kathmandu (Bagbazar), Itahari (Sunsari), Damak (Jhapa), and Damauli (Tanahun). Free student counselling at all locations.",
  alternates: { canonical: "https://transiteducation.com.np/locations" },
  openGraph: {
    title: "Our Locations | Transit Education Nepal",
    description: "4 branches across Nepal — Kathmandu, Itahari, Damak, and Damauli. Walk in for free counselling.",
    url: "https://transiteducation.com.np/locations",
    type: "website",
  },
};

const BRANCHES = [
  {
    slug: "kathmandu",
    name: "Kathmandu",
    label: "Head Office",
    address: "Level 2, Purple House, Bagbazar, Kathmandu-4",
    phone: "01-5906277",
    email: "info@transiteducation.com.np",
    hours: "Sun – Fri • 9:00 AM – 6:00 PM",
    image: "https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2026/04/Transit-ktm-1.webp",
  },
  {
    slug: "itahari",
    name: "Itahari",
    label: "Sunsari",
    address: "Rano Complex, Sangit Chowk, Itahari, Sunsari",
    phone: "025-590570",
    email: "itahari@transiteducation.com.np",
    hours: "Sun – Fri • 9:00 AM – 6:00 PM",
    image: "https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2026/04/Transit-ithari.png",
  },
  {
    slug: "damak",
    name: "Damak",
    label: "Jhapa",
    address: "Dipini Marg, Near Sagarmatha Petrol Pump, Damak, Jhapa",
    phone: "023-577162",
    email: "damak@transiteducation.com.np",
    hours: "Sun – Fri • 9:00 AM – 5:00 PM",
    image: "https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2026/04/Transit-Consultancy-Damak-.png",
  },
  {
    slug: "damauli",
    name: "Damauli",
    label: "Tanahun",
    address: "Main Road, Damauli, Tanahun, Nepal",
    phone: "065-590110",
    email: "damauli@transiteducation.com.np",
    hours: "Sun – Fri • 10:00 AM – 5:00 PM",
    image: "https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2026/04/Transit-Education-Damauli-.png",
  },
];

export default function LocationsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-black text-white pt-32 pb-20">
        <div className="container">
          <SectionLabel>Our Offices</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-6 max-w-2xl">
            4 Branches Across Nepal
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
            Walk in for free counselling at any of our four offices. No appointment needed. Our advisors are here to help you find the right path to global education.
          </p>
        </div>
      </section>

      {/* Branch Grid */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {BRANCHES.map((branch) => (
              <Link
                key={branch.slug}
                href={`/locations/${branch.slug}`}
                className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#A93226]/20 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={branch.image}
                    alt={`Transit Education ${branch.name} office`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-[#A93226] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {branch.label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-black">{branch.name}</h2>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#A93226] group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#A93226] shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#A93226] shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#A93226] shrink-0" />
                      <span>{branch.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A93226] shrink-0" />
                      <span>{branch.hours}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <span className="text-[#A93226] font-semibold text-sm group-hover:underline">
                      View office details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#F7F3F3]">
        <div className="container text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-black mb-4">Not sure which branch to visit?</h2>
          <p className="text-gray-600 mb-8">
            Contact our Kathmandu head office and we'll connect you with the right advisor for your location and destination.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#A93226] text-white px-8 py-4 rounded-full font-bold hover:bg-[#7E2219] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
