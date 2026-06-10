import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study in Canada from Nepal | Study Permit, PGWP & PR Path — Transit Education",
  description: "Complete guide to studying in Canada from Nepal. Canada Study Permit, SDS vs non-SDS, PGWP work rights, and pathway to Canadian Permanent Residency for Nepali students.",
  alternates: { canonical: "https://transiteducation.com.np/study-abroad/canada" },
  openGraph: {
    title: "Study in Canada from Nepal | Transit Education",
    description: "Canada Study Permit, SDS stream, PGWP, and path to PR — everything Nepali students need to know.",
    url: "https://transiteducation.com.np/study-abroad/canada",
    type: "website",
  },
};

export default function CanadaPage() {
  return (
    <CountryDestinationPage
      countryId="canada"
      heroImage="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Web-banner-Canada.png"
    />
  );
}
