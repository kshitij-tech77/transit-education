import Hero from "@/components/home/Hero";
import Destinations from "@/components/home/Destinations";
import WelcomeAbout from "@/components/home/WelcomeAbout";
import Services from "@/components/home/Services";
import WhyTransit from "@/components/home/WhyTransit";
import SuccessStories from "@/components/home/SuccessStories";
import TeamTeaser from "@/components/home/TeamTeaser";
import Testimonials from "@/components/home/Testimonials";
import LatestBlog from "@/components/home/LatestBlog";
import ContactCTA from "@/components/home/ContactCTA";
import BranchesStrip from "@/components/home/BranchesStrip";

export default function Home() {
  return (
    <>
      <Hero />
      <Destinations />
      <WelcomeAbout />
      <Services />
      <WhyTransit />
      <SuccessStories />
      <TeamTeaser />
      <Testimonials />
      <LatestBlog />
      <ContactCTA />
      <BranchesStrip />
    </>
  );
}
