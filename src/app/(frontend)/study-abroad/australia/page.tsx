import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study in Australia from Nepal | Visa, Requirements & Scholarships",
  description: "Complete guide to studying in Australia from Nepal. Student Visa Subclass 500, GTE statement, OSHC, IELTS requirements, tuition fees, and scholarship options for Nepali students.",
  alternates: { canonical: "https://transiteducation.com.np/study-abroad/australia" },
  openGraph: {
    title: "Study in Australia from Nepal | Transit Education",
    description: "Student Visa Subclass 500, GTE, work rights, and scholarships — everything Nepali students need to study in Australia.",
    url: "https://transiteducation.com.np/study-abroad/australia",
    type: "website",
  },
};

export default function AustraliaPage() {
  return (
    <CountryDestinationPage
      countryId="australia"
      heroImage="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Wwb-banner-Australia.png"
    />
  );
}
