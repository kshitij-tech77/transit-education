"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import UtilityBar from "./UtilityBar";
import MobileMenu from "./MobileMenu";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  title: string;
  href: string;
}

interface HeaderProps {
  studyAbroadLinks?: NavLink[];
  locationsLinks?: NavLink[];
  servicesLinks?: NavLink[];
  coursesLinks?: NavLink[];
}

const DEFAULT_STUDY_ABROAD = [
  { title: "Canada", href: "/study-abroad/canada" },
  { title: "Australia", href: "/study-abroad/australia" },
  { title: "UK", href: "/study-abroad/uk" },
  { title: "USA", href: "/study-abroad/usa" },
  { title: "New Zealand", href: "/study-abroad/new-zealand" },
  { title: "Germany", href: "/study-abroad/germany" },
  { title: "South Korea", href: "/study-abroad/south-korea" },
  { title: "Ireland", href: "/study-abroad/ireland" },
  { title: "Italy", href: "/study-abroad/italy" },
];

const DEFAULT_SERVICES = [
  { title: "Admission Counselling", href: "/services/admission-counselling" },
  { title: "Student Visa Service", href: "/services/student-visa-service" },
  { title: "Test Preparation", href: "/services/test-preparation" },
  { title: "Scholarships Assistance", href: "/services/scholarships-assistance" },
  { title: "SOP Writing Support", href: "/services/sop-writing" },
];

const DEFAULT_COURSES = [
  { title: "Test Preparation", href: "/courses/test-preparation" },
  { title: "Language Training", href: "/courses/language-training" },
];

const DEFAULT_LOCATIONS = [
  { title: "Kathmandu", href: "/locations/kathmandu" },
  { title: "Itahari", href: "/locations/itahari" },
  { title: "Damak", href: "/locations/damak" },
  { title: "Damauli", href: "/locations/damauli" },
];

export default function Header({
  studyAbroadLinks = DEFAULT_STUDY_ABROAD,
  locationsLinks = DEFAULT_LOCATIONS,
  servicesLinks = DEFAULT_SERVICES,
  coursesLinks = DEFAULT_COURSES
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-white shadow-md" : "bg-white")}>
      <UtilityBar />
      <div className="container h-[80px] flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image
            src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Logo-png_website.png"
            alt="Transit Education"
            width={180}
            height={48}
            priority
            className="h-12 w-auto transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:block">
          <NavigationMenu>
            <NavigationMenuList>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>About Us</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-2 p-4">
                    <li>
                      <NavigationMenuLink render={<Link href="/about" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" />}>
                        About Transit
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink render={<Link href="/team" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" />}>
                        Our Team
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink render={<Link href="/careers" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" />}>
                        Careers
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink render={<Link href="/franchise" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" />}>
                        Become a Partner
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Study Abroad</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] grid-cols-2 gap-2 p-4">
                    {studyAbroadLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink render={<Link href={link.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" />}>
                          {link.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Student Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[250px] gap-2 p-4">
                    {servicesLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink render={<Link href={link.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" />}>
                          {link.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Take Courses</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-2 p-4">
                    {coursesLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink render={<Link href={link.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" />}>
                          {link.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="/blog" />} className={navigationMenuTriggerStyle()}>Blogs</NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="/resources" />} className={navigationMenuTriggerStyle()}>Resources</NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Locations</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-2 p-4">
                    {locationsLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink render={<Link href={link.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" />}>
                          {link.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 lg:gap-4">
          <Link href="/contact" className={buttonVariants({ variant: "brand", className: "hidden lg:inline-flex px-6 rounded-lg" })}>
            Free Consultation
          </Link>
          <div className="ml-2 lg:ml-0">
            <MobileMenu 
              studyAbroadLinks={studyAbroadLinks}
              locationsLinks={locationsLinks}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
