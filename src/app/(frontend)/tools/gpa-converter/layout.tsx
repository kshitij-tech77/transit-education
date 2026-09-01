import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "NEB Percentage to GPA Converter for Nepali Students",
  description: "Free tool to convert your Nepal NEB/SLC percentage into a US-style 4.0 GPA scale for university applications abroad.",
  alternates: { canonical: "/tools/gpa-converter" },
  openGraph: {
    title: "GPA Converter | Transit Education Nepal",
    description: "Convert your NEB or bachelor's percentage into a 4.0-scale GPA for study abroad applications.",
    url: "/tools/gpa-converter",
    type: "website",
  },
};

export default function GpaConverterLayout({ children }: { children: ReactNode }) {
  return children;
}
