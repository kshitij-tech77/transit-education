import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study in the USA from Nepal | F-1 Visa, OPT & Scholarships",
  description: "Complete guide to studying in the USA from Nepal. F-1 student visa process, SEVIS fee, DS-160, OPT work rights, and Fulbright scholarship information for Nepali students.",
  alternates: { canonical: "https://transiteducation.com.np/study-abroad/usa" },
  openGraph: {
    title: "Study in the USA from Nepal | Transit Education",
    description: "F-1 visa, SEVIS, OPT work rights, and top US university scholarships — complete guide for Nepali students.",
    url: "https://transiteducation.com.np/study-abroad/usa",
    type: "website",
  },
};

export default function USAPage() {
  return (
    <CountryDestinationPage
      countryId="usa"
      heroImage="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Web-banner-USA.png"
    />
  );
}
