import CountryDestinationPage from "@/components/country/CountryDestinationPage";
import { getCountryMetadata } from "@/lib/country-metadata";

export const generateMetadata = () => getCountryMetadata("canada", {
  title: "Study in Canada from Nepal | Study Permit, PGWP & PR Path",
  description: "Complete guide to studying in Canada from Nepal. Canada Study Permit, SDS vs non-SDS, PGWP work rights, and pathway to Canadian Permanent Residency for Nepali students.",
  ogTitle: "Study in Canada from Nepal | Transit Education",
  ogDescription: "Canada Study Permit, SDS stream, PGWP, and path to PR — everything Nepali students need to know.",
});

export default function CanadaPage() {
  return (
    <CountryDestinationPage
      countryId="canada"
      heroImage="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/05/Web-banner-Canada.png"
    />
  );
}
