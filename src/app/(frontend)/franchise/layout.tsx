import { SITE_URL } from "@/lib/site-url";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Franchise & Partnership Programme | Transit Education Nepal",
  description: "Open a Transit Education franchise in Nepal. Join an ICEF-accredited network with 300+ university partnerships, proven systems, and full training & operational support.",
  alternates: { canonical: `${SITE_URL}/franchise` },
  openGraph: {
    title: "Transit Education Franchise Opportunity | Nepal's Leading Study Abroad Brand",
    description: "Become a Transit Education partner. Leverage 10+ years of brand equity, 300+ university links, and a fully trained support system to launch your study abroad franchise.",
    url: `${SITE_URL}/franchise`,
    type: "website",
  },
};

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
