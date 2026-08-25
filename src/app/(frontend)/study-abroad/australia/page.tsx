import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { getCountryMetadata } from "@/lib/country-metadata";

export const generateMetadata = () => getCountryMetadata("australia", {
  title: "Study in Australia from Nepal | Visa, Requirements & Scholarships",
  description: "Complete guide to studying in Australia from Nepal. Student Visa Subclass 500, GTE statement, OSHC, IELTS requirements, tuition fees, and scholarship options for Nepali students.",
  ogTitle: "Study in Australia from Nepal | Transit Education",
  ogDescription: "Student Visa Subclass 500, GTE, work rights, and scholarships — everything Nepali students need to study in Australia.",
});

export default function AustraliaPage() {
  return (
    <CountryDestinationPage
      countryId="australia"
      heroImage="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/05/Wwb-banner-Australia.png"
    />
  );
}
