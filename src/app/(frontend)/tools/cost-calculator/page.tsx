"use client";

import { useState } from "react";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";

type Country = "canada" | "australia" | "uk" | "usa" | "germany" | "new-zealand";
type Level = "bachelor" | "master" | "diploma";

interface CostData {
  tuitionMin: number;
  tuitionMax: number;
  livingMin: number;
  livingMax: number;
  currency: string;
  currencySymbol: string;
  visaFee: number;
  healthInsurance: number;
  notes: string[];
}

const COST_DATA: Record<Country, Record<Level, CostData>> = {
  canada: {
    bachelor: {
      tuitionMin: 15000, tuitionMax: 28000, livingMin: 12000, livingMax: 18000,
      currency: "CAD", currencySymbol: "CA$", visaFee: 235, healthInsurance: 800,
      notes: ["Ontario colleges typically CA$8,000–$16,000/yr", "Universities CA$20,000–$35,000/yr", "PGWP work permit after graduation"],
    },
    master: {
      tuitionMin: 20000, tuitionMax: 35000, livingMin: 12000, livingMax: 18000,
      currency: "CAD", currencySymbol: "CA$", visaFee: 235, healthInsurance: 800,
      notes: ["MBA programs CA$30,000–$60,000/yr", "PGWP up to 3 years after graduation", "SDS stream may reduce processing time"],
    },
    diploma: {
      tuitionMin: 8000, tuitionMax: 16000, livingMin: 12000, livingMax: 16000,
      currency: "CAD", currencySymbol: "CA$", visaFee: 235, healthInsurance: 700,
      notes: ["2-year diploma programs most popular", "PGWP issued equal to program length", "Pathway to Bachelor's available"],
    },
  },
  australia: {
    bachelor: {
      tuitionMin: 22000, tuitionMax: 38000, livingMin: 20000, livingMax: 28000,
      currency: "AUD", currencySymbol: "A$", visaFee: 710, healthInsurance: 700,
      notes: ["OSHC (health cover) mandatory — ~A$700/yr", "48 hrs/fortnight work during semester", "2-year graduate work visa after graduation"],
    },
    master: {
      tuitionMin: 28000, tuitionMax: 48000, livingMin: 20000, livingMax: 28000,
      currency: "AUD", currencySymbol: "A$", visaFee: 710, healthInsurance: 700,
      notes: ["Engineering/IT typically A$32,000–$45,000/yr", "Nursing/Medicine higher", "3-year graduate work visa for some fields"],
    },
    diploma: {
      tuitionMin: 15000, tuitionMax: 25000, livingMin: 18000, livingMax: 24000,
      currency: "AUD", currencySymbol: "A$", visaFee: 710, healthInsurance: 600,
      notes: ["VET/TAFE programs typically A$4,000–$22,000/yr", "Pathway to degree programs", "OSHC mandatory"],
    },
  },
  uk: {
    bachelor: {
      tuitionMin: 14000, tuitionMax: 26000, livingMin: 12000, livingMax: 18000,
      currency: "GBP", currencySymbol: "£", visaFee: 490, healthInsurance: 776,
      notes: ["IHS (Immigration Health Surcharge) £776/yr mandatory", "London costs 30–40% higher than outside London", "Graduate Route Visa 2 years after graduation"],
    },
    master: {
      tuitionMin: 16000, tuitionMax: 32000, livingMin: 12000, livingMax: 20000,
      currency: "GBP", currencySymbol: "£", visaFee: 490, healthInsurance: 776,
      notes: ["1-year Master's programs available", "Graduate Route Visa 3 years for postgrad", "MBA at top schools £40,000–£60,000+"],
    },
    diploma: {
      tuitionMin: 10000, tuitionMax: 18000, livingMin: 10000, livingMax: 16000,
      currency: "GBP", currencySymbol: "£", visaFee: 490, healthInsurance: 776,
      notes: ["Foundation and HND programs available", "Pathway to Bachelor's at UK universities", "IHS mandatory for entire visa duration"],
    },
  },
  usa: {
    bachelor: {
      tuitionMin: 18000, tuitionMax: 45000, livingMin: 15000, livingMax: 25000,
      currency: "USD", currencySymbol: "$", visaFee: 350, healthInsurance: 2000,
      notes: ["Community colleges $8,000–$15,000/yr — transfer pathway", "State universities $15,000–$30,000/yr", "OPT work permit 12 months after graduation (STEM: 36 months)"],
    },
    master: {
      tuitionMin: 25000, tuitionMax: 55000, livingMin: 15000, livingMax: 28000,
      currency: "USD", currencySymbol: "$", visaFee: 350, healthInsurance: 2500,
      notes: ["STEM programs eligible for 3-year OPT", "Graduate assistantships may cover tuition", "Ivy League and top-20 schools $50,000–$80,000/yr"],
    },
    diploma: {
      tuitionMin: 8000, tuitionMax: 18000, livingMin: 12000, livingMax: 20000,
      currency: "USD", currencySymbol: "$", visaFee: 350, healthInsurance: 1500,
      notes: ["Community college associate degrees (2 years)", "Transfer to 4-year university common pathway", "F-1 visa required"],
    },
  },
  germany: {
    bachelor: {
      tuitionMin: 0, tuitionMax: 1000, livingMin: 9000, livingMax: 14000,
      currency: "EUR", currencySymbol: "€", visaFee: 75, healthInsurance: 1300,
      notes: ["Public universities: €0 tuition + semester fee €100–€350/semester", "€11,208 blocked account required for visa", "18-month job seeker visa after graduation"],
    },
    master: {
      tuitionMin: 0, tuitionMax: 2000, livingMin: 9000, livingMax: 14000,
      currency: "EUR", currencySymbol: "€", visaFee: 75, healthInsurance: 1300,
      notes: ["APS certificate mandatory for Nepali students", "Most English-taught Master's: no tuition", "DAAD scholarships available"],
    },
    diploma: {
      tuitionMin: 0, tuitionMax: 500, livingMin: 9000, livingMax: 12000,
      currency: "EUR", currencySymbol: "€", visaFee: 75, healthInsurance: 1300,
      notes: ["Ausbildung (vocational training) programs", "Students paid €600–€800/month during training", "Strong job placement rates"],
    },
  },
  "new-zealand": {
    bachelor: {
      tuitionMin: 22000, tuitionMax: 35000, livingMin: 15000, livingMax: 22000,
      currency: "NZD", currencySymbol: "NZ$", visaFee: 330, healthInsurance: 0,
      notes: ["20 hrs/week work during semester", "Post-study work visa up to 3 years", "Health insurance not mandatory but recommended"],
    },
    master: {
      tuitionMin: 26000, tuitionMax: 40000, livingMin: 15000, livingMax: 22000,
      currency: "NZD", currencySymbol: "NZ$", visaFee: 330, healthInsurance: 0,
      notes: ["NZ qualifications highly regarded in Australia", "Pathway to residency available", "Research Master's may have lower fees"],
    },
    diploma: {
      tuitionMin: 14000, tuitionMax: 22000, livingMin: 13000, livingMax: 18000,
      currency: "NZD", currencySymbol: "NZ$", visaFee: 330, healthInsurance: 0,
      notes: ["Graduate diploma programs (1 year) available", "Post-study open work visa possible", "NZQA framework qualifications"],
    },
  },
};

const NPR_RATES: Record<string, number> = {
  CAD: 96,
  AUD: 88,
  GBP: 170,
  USD: 135,
  EUR: 148,
  NZD: 81,
};

const COUNTRY_LABELS: Record<Country, string> = {
  canada: "🇨🇦 Canada",
  australia: "🇦🇺 Australia",
  uk: "🇬🇧 United Kingdom",
  usa: "🇺🇸 USA",
  germany: "🇩🇪 Germany",
  "new-zealand": "🇳🇿 New Zealand",
};

export default function CostCalculatorPage() {
  const [country, setCountry] = useState<Country>("canada");
  const [level, setLevel] = useState<Level>("bachelor");
  const [duration, setDuration] = useState(2);
  const [showNPR, setShowNPR] = useState(false);

  const data = COST_DATA[country][level];
  const rate = NPR_RATES[data.currency];

  const tuitionMinTotal = data.tuitionMin * duration;
  const tuitionMaxTotal = data.tuitionMax * duration;
  const livingMinTotal = data.livingMin * duration;
  const livingMaxTotal = data.livingMax * duration;
  const visaTotal = data.visaFee;
  const insuranceTotal = data.healthInsurance * duration;

  const grandMin = tuitionMinTotal + livingMinTotal + visaTotal + insuranceTotal;
  const grandMax = tuitionMaxTotal + livingMaxTotal + visaTotal + insuranceTotal;

  const fmt = (n: number) =>
    showNPR
      ? `NPR ${(n * rate).toLocaleString("en-IN")}`
      : `${data.currencySymbol}${n.toLocaleString("en-US")}`;

  return (
    <main className="pt-20">
      <section className="bg-black py-16 text-white">
        <div className="container">
          <Link href="/tools" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
          <SectionLabel className="text-white border-white/20 bg-white/10">Free Tool</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4">Study Abroad Cost Calculator</h1>
          <p className="text-gray-400 max-w-xl">
            Estimate your total study abroad budget for Canada, Australia, UK, USA, Germany, and New Zealand. Toggle NPR conversion for easy budgeting.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Inputs */}
            <div className="space-y-6">
              <div className="bg-off-white border border-gray-100 rounded-[2.5rem] p-8">
                <h2 className="text-2xl font-bold text-black mb-8">Your Study Plan</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Destination Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value as Country)}
                      className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-black font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                      {(Object.keys(COUNTRY_LABELS) as Country[]).map((c) => (
                        <option key={c} value={c}>{COUNTRY_LABELS[c]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Level of Study</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["bachelor", "master", "diploma"] as Level[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLevel(l)}
                          className={`py-3 rounded-2xl font-bold text-sm capitalize transition-all ${level === l ? "bg-brand text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand/30"}`}
                        >
                          {l === "bachelor" ? "Bachelor's" : l === "master" ? "Master's" : "Diploma"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Program Duration: {duration} year{duration > 1 ? "s" : ""}</label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full accent-brand"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1 year</span>
                      <span>2 years</span>
                      <span>3 years</span>
                      <span>4 years</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setShowNPR(!showNPR)}
                      className={`w-12 h-6 rounded-full transition-all ${showNPR ? "bg-brand" : "bg-gray-300"} relative`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${showNPR ? "left-7" : "left-1"}`} />
                    </button>
                    <span className="text-sm font-medium text-black">
                      Show in NPR (approx. 1 {data.currency} = NPR {rate})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="space-y-4">
              <div className="bg-brand rounded-[2.5rem] p-8 text-white">
                <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">
                  Total Estimated Cost ({duration} yr)
                </p>
                <div className="text-4xl font-black my-3">
                  {fmt(grandMin)} – {fmt(grandMax)}
                </div>
                <p className="text-white/60 text-sm">{COUNTRY_LABELS[country]} · {level === "bachelor" ? "Bachelor's" : level === "master" ? "Master's" : "Diploma"}</p>
              </div>

              <div className="bg-off-white border border-gray-100 rounded-[2.5rem] p-8">
                <h3 className="text-lg font-bold text-black mb-6">Cost Breakdown (per {duration} year{duration > 1 ? "s" : ""})</h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Tuition Fees",
                      min: tuitionMinTotal,
                      max: tuitionMaxTotal,
                      note: country === "germany" && tuitionMinTotal === 0 ? "Free at public universities" : undefined,
                    },
                    { label: "Living Expenses", min: livingMinTotal, max: livingMaxTotal },
                    { label: "Health Insurance / OSHC / IHS", min: insuranceTotal, max: insuranceTotal },
                    { label: "Visa Fee (one-time)", min: visaTotal, max: visaTotal },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-black">{item.label}</p>
                        {item.note && <p className="text-xs text-green-600 font-medium">{item.note}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        {item.min === item.max
                          ? <p className="text-sm font-bold text-black">{fmt(item.min)}</p>
                          : <p className="text-sm font-bold text-black">{fmt(item.min)}–{fmt(item.max)}</p>
                        }
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3">
                    <p className="font-black text-black">Total Range</p>
                    <p className="font-black text-brand">{fmt(grandMin)} – {fmt(grandMax)}</p>
                  </div>
                </div>

                {data.notes.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="flex gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-blue-800">Key Notes for {COUNTRY_LABELS[country].split(" ").slice(1).join(" ")}</p>
                    </div>
                    <ul className="space-y-1">
                      {data.notes.map((note, i) => (
                        <li key={i} className="text-xs text-blue-700">• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 px-4 text-center">
                Estimates only. Exchange rates, tuition, and living costs change annually. Book a free consultation for personalised financial guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-off-white border-t border-gray-100">
        <div className="container text-center">
          <p className="text-gray-600 mb-4 text-sm">Need help planning your finances or education loan?</p>
          <Link href="/contact" className="bg-brand text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-all">
            Book Free Financial Guidance Session
          </Link>
        </div>
      </section>
    </main>
  );
}
