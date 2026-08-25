import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { getCountryMetadata } from "@/lib/country-metadata";

export const generateMetadata = () => getCountryMetadata("germany", {
  title: "Study in Germany from Nepal | Free Education, APS & DAAD",
  description: "Complete guide to studying in Germany from Nepal. Free public university education, APS certificate process, blocked account (Sperrkonto), DAAD scholarships, and National D Visa guidance.",
  ogTitle: "Study in Germany from Nepal | Transit Education",
  ogDescription: "Free tuition at public universities, APS certificate, DAAD scholarships, and 18-month post-study work visa — complete guide for Nepali students.",
});

export default function GermanyPage() {
  return (
    <CountryDestinationPage
      countryId="germany"
      heroImage="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/03/student-library-books-3500990.jpg"
    />
  );
}
