import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { getCountryMetadata } from "@/lib/country-metadata";

export const generateMetadata = () => getCountryMetadata("uk", {
  title: "Study in the UK from Nepal | Student Visa, CAS & Graduate Route",
  description: "Complete guide to studying in the UK from Nepal. UK Student visa (Student Route), CAS number, TB test, IHS surcharge, Chevening scholarship, and Graduate Route visa for Nepali students.",
  ogTitle: "Study in the UK from Nepal | Transit Education",
  ogDescription: "UK Student visa, CAS, 1-year master's, Graduate Route visa — complete guide for Nepali students.",
});

export default function UKPage() {
  return (
    <CountryDestinationPage
      countryId="uk"
      heroImage="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/05/web-banner-UK.png"
    />
  );
}
