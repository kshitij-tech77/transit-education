import { Metadata } from "next";
import CareersClient from "./CareersClient";

export const metadata: Metadata = {
  title: "Careers at Transit Education Nepal | Join Our Team",
  description: "Join Transit Education — Nepal's leading study abroad consultancy. We're hiring education counsellors, visa specialists, and marketing professionals in Kathmandu and across Nepal.",
  alternates: { canonical: "https://transiteducation.com.np/careers" },
  openGraph: {
    title: "Careers at Transit Education Nepal",
    description: "Help Nepali students achieve their global education dreams. View open positions and apply to join our team.",
    url: "https://transiteducation.com.np/careers",
    type: "website",
  },
};

export default function CareersPage() {
  return <CareersClient />;
}
