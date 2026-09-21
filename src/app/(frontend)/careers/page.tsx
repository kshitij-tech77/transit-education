import { SITE_URL } from "@/lib/site-url";
import { Metadata } from "next";
import CareersClient from "./CareersClient";

export const metadata: Metadata = {
  title: "Careers at Transit Education Nepal | Join Our Team",
  description: "Join Transit Education — Nepal's leading study abroad consultancy. We're hiring education counsellors, visa specialists, and marketing professionals in Kathmandu and across Nepal.",
  alternates: { canonical: `${SITE_URL}/careers` },
  openGraph: {
    title: "Careers at Transit Education Nepal",
    description: "Help Nepali students achieve their global education dreams. View open positions and apply to join our team.",
    url: `${SITE_URL}/careers`,
    type: "website",
  },
};

export default function CareersPage() {
  return <CareersClient />;
}
