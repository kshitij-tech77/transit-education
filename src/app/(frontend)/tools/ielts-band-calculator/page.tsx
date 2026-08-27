"use client";

import { useState } from "react";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

const BAND_LABELS: Record<number, string> = {
  0: "Did not attempt",
  1: "Non-user",
  2: "Intermittent user",
  3: "Extremely limited user",
  4: "Limited user",
  5: "Modest user",
  6: "Competent user",
  7: "Good user",
  8: "Very good user",
  9: "Expert user",
};

const SCORE_OPTIONS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const COUNTRY_REQUIREMENTS = [
  {
    country: "Canada (Universities)",
    ug: 6.5,
    pg: 6.5,
    note: "Each band min 6.0",
  },
  {
    country: "Canada (Colleges/Diploma)",
    ug: 6.0,
    pg: 6.5,
    note: "Each band min 5.5",
  },
  {
    country: "Australia (Universities)",
    ug: 6.5,
    pg: 6.5,
    note: "Each band min 6.0",
  },
  {
    country: "UK (Universities)",
    ug: 6.0,
    pg: 6.5,
    note: "Varies by institution",
  },
  {
    country: "UK (Nursing/Medicine)",
    ug: 7.0,
    pg: 7.0,
    note: "Each band min 7.0",
  },
  {
    country: "USA (Universities)",
    ug: 6.0,
    pg: 6.5,
    note: "Many accept TOEFL also",
  },
  {
    country: "New Zealand",
    ug: 6.0,
    pg: 6.5,
    note: "Each band min 5.5",
  },
  {
    country: "Germany (English programs)",
    ug: 6.0,
    pg: 6.5,
    note: "Some require 7.0",
  },
];

function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2;
}

export default function IeltsBandCalculatorPage() {
  const [scores, setScores] = useState({ listening: 0, reading: 0, writing: 0, speaking: 0 });
  const [calculated, setCalculated] = useState(false);

  const overall = roundToHalf(
    (scores.listening + scores.reading + scores.writing + scores.speaking) / 4
  );

  const handleCalc = () => setCalculated(true);
  const handleReset = () => {
    setScores({ listening: 0, reading: 0, writing: 0, speaking: 0 });
    setCalculated(false);
  };

  return (
    <main className="pt-20">
      <section className="bg-black py-24 text-white">
        <div className="container">
          <Link href="/tools" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
          <SectionLabel className="text-white border-white/20 bg-white/10">Free Tool</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4">IELTS Band Score Calculator</h1>
          <p className="text-gray-400 max-w-xl">
            Enter your four skill scores to calculate your overall band. See which study destinations and programs your score qualifies for.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Input */}
            <div className="bg-off-white border border-gray-100 rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-bold text-black mb-8">Enter Your Scores</h2>
              <div className="space-y-6">
                {(["listening", "reading", "writing", "speaking"] as const).map((skill) => (
                  <div key={skill}>
                    <label className="block text-sm font-bold text-black mb-2 capitalize">{skill}</label>
                    <select
                      value={scores[skill]}
                      onChange={(e) => {
                        setScores((prev) => ({ ...prev, [skill]: parseFloat(e.target.value) }));
                        setCalculated(false);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-black font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                      {SCORE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s} {s > 0 ? `— ${BAND_LABELS[Math.floor(s)]}` : "— Not attempted"}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleCalc}
                  className="flex-1 bg-brand text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
                >
                  Calculate Overall Band
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 bg-gray-100 text-black py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Result */}
            <div className="space-y-6">
              {calculated ? (
                <>
                  <div className="bg-brand rounded-[2.5rem] p-8 text-white text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2">Your Overall Band</p>
                    <div className="text-8xl font-black my-4">{overall}</div>
                    <p className="text-white/80">{BAND_LABELS[Math.floor(overall)]}</p>
                    <div className="grid grid-cols-4 gap-3 mt-8 text-center">
                      {(["listening", "reading", "writing", "speaking"] as const).map((skill) => (
                        <div key={skill} className="bg-white/10 rounded-2xl p-3">
                          <p className="text-2xl font-black">{scores[skill]}</p>
                          <p className="text-xs text-white/60 capitalize mt-1">{skill.slice(0, 3)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-off-white border border-gray-100 rounded-[2.5rem] p-8">
                    <h3 className="text-xl font-bold text-black mb-6">Destination Eligibility</h3>
                    <div className="space-y-3">
                      {COUNTRY_REQUIREMENTS.map((req, i) => {
                        const meets = overall >= req.ug;
                        return (
                          <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${meets ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                            {meets ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className={`font-bold text-sm ${meets ? "text-green-800" : "text-red-800"}`}>
                                {req.country}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Min required: {req.ug} · {req.note}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Requirements vary by institution and program. Consult a counsellor for specific requirements.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-off-white border border-gray-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-black mb-2">Enter your scores</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Select your four skill scores and click Calculate to see your overall band and which destinations you qualify for.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-off-white border-t border-gray-100">
        <div className="container text-center">
          <p className="text-gray-600 mb-4 text-sm">Need IELTS coaching to improve your score?</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/services/test-preparation" className="bg-brand text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-all">
              IELTS Preparation Classes
            </Link>
            <Link href="/contact" className="bg-white text-black border border-gray-200 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-all">
              Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
