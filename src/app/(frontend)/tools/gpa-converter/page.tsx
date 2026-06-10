"use client";

import { useState } from "react";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Mode = "neb" | "bachelor" | "gpa_to_pct";

function nebToGpa(pct: number): { gpa: number; grade: string; letter: string } {
  if (pct >= 90) return { gpa: 4.0, grade: "A+", letter: "Distinction" };
  if (pct >= 80) return { gpa: 3.6, grade: "A", letter: "Excellent" };
  if (pct >= 70) return { gpa: 3.2, grade: "B+", letter: "Very Good" };
  if (pct >= 60) return { gpa: 2.8, grade: "B", letter: "Good" };
  if (pct >= 50) return { gpa: 2.4, grade: "C+", letter: "Satisfactory" };
  if (pct >= 40) return { gpa: 2.0, grade: "C", letter: "Acceptable" };
  if (pct >= 33) return { gpa: 1.6, grade: "D", letter: "Partially Acceptable" };
  return { gpa: 0, grade: "NG", letter: "Not Graded" };
}

function bachelorToGpa(pct: number): { gpa: number; classification: string } {
  if (pct >= 80) return { gpa: 4.0, classification: "Distinction" };
  if (pct >= 75) return { gpa: 3.7, classification: "First Division with Distinction" };
  if (pct >= 70) return { gpa: 3.3, classification: "First Division" };
  if (pct >= 65) return { gpa: 3.0, classification: "First Division" };
  if (pct >= 60) return { gpa: 2.7, classification: "Second Division (Upper)" };
  if (pct >= 55) return { gpa: 2.3, classification: "Second Division" };
  if (pct >= 50) return { gpa: 2.0, classification: "Second Division" };
  if (pct >= 45) return { gpa: 1.7, classification: "Third Division" };
  if (pct >= 40) return { gpa: 1.3, classification: "Third Division" };
  return { gpa: 1.0, classification: "Pass" };
}

function gpaToPercent(gpa: number): number {
  if (gpa >= 4.0) return 93;
  if (gpa >= 3.7) return 90;
  if (gpa >= 3.3) return 87;
  if (gpa >= 3.0) return 83;
  if (gpa >= 2.7) return 80;
  if (gpa >= 2.3) return 77;
  if (gpa >= 2.0) return 73;
  if (gpa >= 1.7) return 70;
  if (gpa >= 1.3) return 67;
  if (gpa >= 1.0) return 63;
  return 60;
}

const GPA_OPTIONS = [4.0, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2, 3.1, 3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0];

export default function GpaConverterPage() {
  const [mode, setMode] = useState<Mode>("neb");
  const [percentage, setPercentage] = useState("");
  const [gpaInput, setGpaInput] = useState(3.5);
  const [result, setResult] = useState<any>(null);

  const handleConvert = () => {
    const pct = parseFloat(percentage);
    if (mode === "neb") {
      if (isNaN(pct) || pct < 0 || pct > 100) return;
      setResult({ type: "neb", pct, ...nebToGpa(pct) });
    } else if (mode === "bachelor") {
      if (isNaN(pct) || pct < 0 || pct > 100) return;
      setResult({ type: "bachelor", pct, ...bachelorToGpa(pct) });
    } else {
      setResult({ type: "gpa_to_pct", gpa: gpaInput, percent: gpaToPercent(gpaInput) });
    }
  };

  const TABS: { id: Mode; label: string }[] = [
    { id: "neb", label: "NEB +2 → GPA" },
    { id: "bachelor", label: "Bachelor's % → GPA" },
    { id: "gpa_to_pct", label: "GPA → Percentage" },
  ];

  return (
    <main className="pt-20">
      <section className="bg-black py-16 text-white">
        <div className="container">
          <Link href="/tools" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
          <SectionLabel className="text-white border-white/20 bg-white/10">Free Tool</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4">GPA Converter</h1>
          <p className="text-gray-400 max-w-xl">
            Convert Nepal NEB/SLC percentage to GPA (4.0 scale) or convert a GPA back to percentage. Used by universities in Canada, USA, UK, and Australia.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {/* Tabs */}
            <div className="flex bg-off-white border border-gray-100 rounded-2xl p-1 mb-8">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setMode(tab.id); setResult(null); }}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === tab.id ? "bg-brand text-white shadow" : "text-gray-500 hover:text-black"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-off-white border border-gray-100 rounded-[2.5rem] p-8">
              {mode === "gpa_to_pct" ? (
                <div>
                  <label className="block text-sm font-bold text-black mb-2">GPA (4.0 scale)</label>
                  <select
                    value={gpaInput}
                    onChange={(e) => { setGpaInput(parseFloat(e.target.value)); setResult(null); }}
                    className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-black font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 mb-6"
                  >
                    {GPA_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g.toFixed(1)}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    {mode === "neb" ? "NEB +2 Percentage (%)" : "Bachelor's Degree Percentage (%)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={percentage}
                    onChange={(e) => { setPercentage(e.target.value); setResult(null); }}
                    placeholder="e.g. 78"
                    className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-black font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 mb-2"
                  />
                  <p className="text-xs text-gray-400 mb-6">Enter a value between 0 and 100</p>
                </div>
              )}

              <button
                onClick={handleConvert}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
              >
                Convert
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-6 bg-brand rounded-[2.5rem] p-8 text-white text-center">
                {result.type === "neb" && (
                  <>
                    <p className="text-white/70 text-sm mb-2">{result.pct}% NEB converts to</p>
                    <div className="text-7xl font-black my-4">{result.gpa}</div>
                    <p className="text-2xl font-bold">{result.grade} — {result.letter}</p>
                    <p className="text-white/60 text-sm mt-4">on the 4.0 GPA scale</p>
                  </>
                )}
                {result.type === "bachelor" && (
                  <>
                    <p className="text-white/70 text-sm mb-2">{result.pct}% Bachelor's converts to</p>
                    <div className="text-7xl font-black my-4">{result.gpa}</div>
                    <p className="text-xl font-bold">{result.classification}</p>
                    <p className="text-white/60 text-sm mt-4">on the 4.0 GPA scale</p>
                  </>
                )}
                {result.type === "gpa_to_pct" && (
                  <>
                    <p className="text-white/70 text-sm mb-2">GPA {result.gpa.toFixed(1)} is approximately</p>
                    <div className="text-7xl font-black my-4">{result.percent}%</div>
                    <p className="text-white/60 text-sm mt-4">This is an approximation based on standard conversion tables</p>
                  </>
                )}
              </div>
            )}

            {/* Reference Table */}
            <div className="mt-8 bg-off-white border border-gray-100 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold text-black mb-6">
                {mode === "neb" ? "NEB to GPA Reference Table" : mode === "bachelor" ? "Bachelor's % to GPA Reference" : "GPA to Percentage Reference"}
              </h3>
              {mode !== "gpa_to_pct" ? (
                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="py-3 px-4 text-left">Percentage</th>
                        <th className="py-3 px-4 text-left">{mode === "neb" ? "Grade" : "Classification"}</th>
                        <th className="py-3 px-4 text-left">GPA (4.0)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mode === "neb"
                        ? [
                            ["90–100%", "A+", "4.0"],
                            ["80–89%", "A", "3.6"],
                            ["70–79%", "B+", "3.2"],
                            ["60–69%", "B", "2.8"],
                            ["50–59%", "C+", "2.4"],
                            ["40–49%", "C", "2.0"],
                            ["33–39%", "D", "1.6"],
                          ]
                        : [
                            ["80%+", "Distinction", "4.0"],
                            ["75–79%", "First Division (Dist)", "3.7"],
                            ["70–74%", "First Division", "3.3"],
                            ["65–69%", "First Division", "3.0"],
                            ["60–64%", "Second Division (Upper)", "2.7"],
                            ["55–59%", "Second Division", "2.3"],
                            ["50–54%", "Second Division", "2.0"],
                          ].map(([pct, cls, gpa]) => (
                        <tr key={pct} className="bg-white hover:bg-off-white">
                          <td className="py-3 px-4 font-semibold">{pct}</td>
                          <td className="py-3 px-4 text-gray-600">{cls}</td>
                          <td className="py-3 px-4 font-bold text-brand">{gpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="py-3 px-4 text-left">GPA</th>
                        <th className="py-3 px-4 text-left">~Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[["4.0", "93%+"], ["3.7", "90%"], ["3.3", "87%"], ["3.0", "83%"], ["2.7", "80%"], ["2.3", "77%"], ["2.0", "73%"]].map(([g, p]) => (
                        <tr key={g} className="bg-white hover:bg-off-white">
                          <td className="py-3 px-4 font-bold text-brand">{g}</td>
                          <td className="py-3 px-4 text-gray-600">{p}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">
                Conversion is approximate. Different universities may use different scales. Always verify with the specific institution.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-off-white border-t border-gray-100">
        <div className="container text-center">
          <p className="text-gray-600 mb-4 text-sm">Unsure if your GPA meets requirements for your target university?</p>
          <Link href="/contact" className="bg-brand text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-all">
            Book Free Profile Evaluation
          </Link>
        </div>
      </section>
    </main>
  );
}
