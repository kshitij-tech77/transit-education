import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { getCountryMetadata } from "@/lib/country-metadata";

export const generateMetadata = () => getCountryMetadata("usa", {
  title: "Study in the USA from Nepal | F-1 Visa, OPT & Scholarships",
  description: "Complete guide to studying in the USA from Nepal. F-1 student visa process, SEVIS fee, DS-160, OPT work rights, and Fulbright scholarship information for Nepali students.",
  ogTitle: "Study in the USA from Nepal | Transit Education",
  ogDescription: "F-1 visa, SEVIS, OPT work rights, and top US university scholarships — complete guide for Nepali students.",
});

export default function USAPage() {
  return (
    <CountryDestinationPage
      countryId="usa"
      heroImage="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/05/Web-banner-USA.png"
    />
  );
}
