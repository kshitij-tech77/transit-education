import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "IELTS Band Score Calculator | Free Overall Band Estimator",
  description: "Free IELTS band score calculator. Enter your Listening, Reading, Writing, and Speaking scores to instantly estimate your overall IELTS band.",
  alternates: { canonical: "/tools/ielts-band-calculator" },
  openGraph: {
    title: "IELTS Band Score Calculator | Transit Education Nepal",
    description: "Calculate your overall IELTS band score from your four individual module scores.",
    url: "/tools/ielts-band-calculator",
    type: "website",
  },
};

export default function IeltsBandCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
