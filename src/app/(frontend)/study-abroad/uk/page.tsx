import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study in the UK from Nepal | Student Visa, CAS & Graduate Route",
  description: "Complete guide to studying in the UK from Nepal. UK Student visa (Student Route), CAS number, TB test, IHS surcharge, Chevening scholarship, and Graduate Route visa for Nepali students.",
  alternates: { canonical: "https://transiteducation.com.np/study-abroad/uk" },
  openGraph: {
    title: "Study in the UK from Nepal | Transit Education",
    description: "UK Student visa, CAS, 1-year master's, Graduate Route visa — complete guide for Nepali students.",
    url: "https://transiteducation.com.np/study-abroad/uk",
    type: "website",
  },
};

export default function UKPage() {
  return (
    <CountryDestinationPage
      countryId="uk"
      heroImage="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/web-banner-UK.png"
    />
  );
}
