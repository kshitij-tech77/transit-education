import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Study Abroad Cost Calculator | Tuition & Living Costs Estimator",
  description: "Free cost calculator for Nepali students. Estimate tuition and living costs in Canada, Australia, UK, USA, Germany, and New Zealand by program level.",
  alternates: { canonical: "/tools/cost-calculator" },
  openGraph: {
    title: "Study Abroad Cost Calculator | Transit Education Nepal",
    description: "Estimate your total tuition and living cost for studying in Canada, Australia, UK, USA, Germany, or New Zealand.",
    url: "/tools/cost-calculator",
    type: "website",
  },
};

export default function CostCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
