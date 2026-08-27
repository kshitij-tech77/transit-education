import { Star, ExternalLink } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";

const REVIEWS = [
  {
    name: "Bibek Sharma",
    date: "January 2026",
    rating: 5,
    text: "Transit Education made my Canada study permit process completely stress-free. My counsellor Priya was always available and guided me through every document. Got my visa in 8 weeks!",
    country: "Canada",
    university: "Fanshawe College",
  },
  {
    name: "Sushma Rai",
    date: "March 2026",
    rating: 5,
    text: "Best consultancy in Kathmandu for Australia. They helped me choose the right course, sorted my SOP, and my visa was approved on the first attempt. Highly recommend!",
    country: "Australia",
    university: "Curtin University",
  },
  {
    name: "Roshan Thapa",
    date: "February 2026",
    rating: 5,
    text: "Very professional team. I was confused between UK and Canada but after my counselling session, everything was clear. Now studying in UK and loving it. Thank you Transit!",
    country: "UK",
    university: "University of Hertfordshire",
  },
  {
    name: "Anisha Pradhan",
    date: "April 2026",
    rating: 5,
    text: "The IELTS preparation classes at Transit are excellent. I improved from 5.5 to 7.0 in just 2 months. The mock tests and feedback from teachers made all the difference.",
    country: "Canada",
    university: "George Brown College",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function GoogleReviews() {
  const MAPS_URL =
    "https://www.google.com/maps/search/Transit+Education+Nepal+Kathmandu";

  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <SectionLabel>Google Reviews</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4">
              What Students Say About Us
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-black text-black">4.9</div>
              <StarRating rating={5} />
              <p className="text-xs text-gray-500 mt-1">Based on Google Reviews</p>
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-brand font-bold text-sm border border-brand/30 rounded-xl px-4 py-2 hover:bg-brand hover:text-white transition-all"
            >
              See All Reviews <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="bg-off-white border border-gray-100 rounded-[2rem] p-6 flex flex-col gap-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-lg">
                  {r.name[0]}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>

              <div>
                <p className="font-bold text-black text-sm">{r.name}</p>
                <p className="text-xs text-gray-400">{r.date}</p>
              </div>

              <StarRating rating={r.rating} />

              <p className="text-gray-600 text-sm leading-relaxed flex-1">{r.text}</p>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-brand font-semibold">
                  {r.country} — {r.university}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
