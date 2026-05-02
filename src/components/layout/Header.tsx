"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UtilityBar from "./UtilityBar";
import MobileMenu from "./MobileMenu";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const studyAbroadLinks = [
  { title: "Canada", href: "/study-abroad/canada" },
  { title: "Australia", href: "/study-abroad/australia" },
  { title: "UK", href: "/study-abroad/uk" },
  { title: "USA", href: "/study-abroad/usa" },
  { title: "New Zealand", href: "/study-abroad/new-zealand" },
  { title: "South Korea", href: "/study-abroad/south-korea" },
  { title: "Ireland", href: "/study-abroad/ireland" },
  { title: "Italy", href: "/study-abroad/italy" },
];

const servicesLinks = [
  { title: "Admission Counselling", href: "/services/admission-counselling" },
  { title: "Student Visa Service", href: "/services/student-visa-service" },
  { title: "Test Preparation", href: "/services/test-preparation" },
  { title: "Scholarships Assistance", href: "/services/scholarships-assistance" },
];

const coursesLinks = [
  { title: "Test Preparation", href: "/courses/test-preparation" },
  { title: "Language Training", href: "/courses/language-training" },
];

const locationsLinks = [
  { title: "Kathmandu", href: "/locations/kathmandu" },
  { title: "Itahari", href: "/locations/itahari" },
  { title: "Damak", href: "/locations/damak" },
  { title: "Damauli", href: "/locations/damauli" },
];

export default function Header() {
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
        {/* Logo */}
        <Link href="/" className="font-extrabold text-2xl tracking-tighter text-brand">
          Transit<span className="text-black">.</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:block">
          <NavigationMenu>
            <NavigationMenuList>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>About Us</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-2 p-4">
                    <li><NavigationMenuLink asChild><Link href="/about" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">About Transit</Link></NavigationMenuLink></li>
                    <li><NavigationMenuLink asChild><Link href="/team" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">Our Team</Link></NavigationMenuLink></li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Study Abroad</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] grid-cols-2 gap-2 p-4">
                    {studyAbroadLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink asChild>
                          <Link href={link.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            {link.title}
                          </Link>
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
                        <NavigationMenuLink asChild>
                          <Link href={link.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            {link.title}
                          </Link>
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
                        <NavigationMenuLink asChild>
                          <Link href={link.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            {link.title}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/blog" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Blogs</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/resources" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Resources</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Locations</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-2 p-4">
                    {locationsLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink asChild>
                          <Link href={link.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            {link.title}
                          </Link>
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
        <div className="flex items-center gap-4">
          <Button asChild className="hidden md:inline-flex bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold px-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <Link href="/contact">Free Consultation</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
