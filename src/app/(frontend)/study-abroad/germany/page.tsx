import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study in Germany from Nepal | Free Education, APS & DAAD — Transit Education",
  description: "Complete guide to studying in Germany from Nepal. Free public university education, APS certificate process, blocked account (Sperrkonto), DAAD scholarships, and National D Visa guidance.",
  alternates: { canonical: "https://transiteducation.com.np/study-abroad/germany" },
  openGraph: {
    title: "Study in Germany from Nepal | Transit Education",
    description: "Free tuition at public universities, APS certificate, DAAD scholarships, and 18-month post-study work visa — complete guide for Nepali students.",
    url: "https://transiteducation.com.np/study-abroad/germany",
    type: "website",
  },
};

export default function GermanyPage() {
  return (
    <CountryDestinationPage
      countryId="germany"
      heroImage="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/student-library-books-3500990.jpg"
    />
  );
}
