import { Metadata } from "next";
import FranchiseClient from "./FranchiseClient";

export const metadata: Metadata = {
  title: "Franchise Opportunity | Become a Transit Education Partner",
  description: "Open a Transit Education franchise in your city. Partner with Nepal's leading study abroad consultancy — 11+ years of brand equity, 100+ university partnerships, and full operational support.",
  alternates: { canonical: "https://transiteducation.com.np/franchise" },
  openGraph: {
    title: "Franchise Opportunity | Transit Education Nepal",
    description: "Start your own study abroad consultancy with Transit Education's proven brand, training, and support system.",
    url: "https://transiteducation.com.np/franchise",
    type: "website",
  },
};

export default function FranchisePage() {
  return <FranchiseClient />;
}
