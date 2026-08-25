"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface NavLink { title: string; href: string; }

interface HeaderProps {
  studyAbroadLinks?: NavLink[];
  locationsLinks?: NavLink[];
  servicesLinks?: NavLink[];
  coursesLinks?: NavLink[];
}

const DEFAULT_STUDY_ABROAD: NavLink[] = [
  { title: "Canada",      href: "/study-abroad/canada" },
  { title: "Australia",   href: "/study-abroad/australia" },
  { title: "UK",          href: "/study-abroad/uk" },
  { title: "USA",         href: "/study-abroad/usa" },
  { title: "New Zealand", href: "/study-abroad/new-zealand" },
  { title: "Germany",     href: "/study-abroad/germany" },
  { title: "South Korea", href: "/study-abroad/south-korea" },
  { title: "Ireland",     href: "/study-abroad/ireland" },
  { title: "Italy",       href: "/study-abroad/italy" },
];

const DEFAULT_SERVICES: NavLink[] = [
  { title: "Admission Counselling",    href: "/services/admission-counselling" },
  { title: "Student Visa Service",     href: "/services/student-visa-service" },
  { title: "Test Preparation",         href: "/services/test-preparation" },
  { title: "Scholarships Assistance",  href: "/services/scholarships-assistance" },
  { title: "SOP Writing Support",      href: "/services/sop-writing" },
  { title: "Compliance Guide",         href: "/compliance" },
];

const DEFAULT_COURSES: NavLink[] = [
  { title: "Test Preparation", href: "/courses/test-preparation" },
  { title: "Language Training", href: "/courses/language-training" },
];

const DEFAULT_LOCATIONS: NavLink[] = [
  { title: "Kathmandu", href: "/locations/kathmandu" },
  { title: "Itahari",   href: "/locations/itahari" },
  { title: "Damak",     href: "/locations/damak" },
  { title: "Damauli",   href: "/locations/damauli" },
];

const MORE_LINKS: NavLink[] = [
  { title: "Blog",        href: "/blog" },
  { title: "Resources",   href: "/resources" },
  { title: "Student Rewards", href: "/portal/login" },
  { title: "Compliance",  href: "/compliance" },
  { title: "Accreditation", href: "/accreditation" },
];

const dropdownLinkCls =
  "block select-none rounded-md px-3 py-2.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground font-medium text-gray-700";

export default function Header({
  studyAbroadLinks = DEFAULT_STUDY_ABROAD,
  locationsLinks   = DEFAULT_LOCATIONS,
  servicesLinks    = DEFAULT_SERVICES,
  coursesLinks     = DEFAULT_COURSES,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const triggerCls = (hrefs: string[]) =>
    cn(
      "text-[13.5px] font-semibold transition-colors",
      hrefs.some(h => isActive(h))
        ? "text-brand"
        : "text-gray-700 hover:text-black"
    );

  const simpleLinkCls = (href: string) =>
    cn(
      navigationMenuTriggerStyle(),
      "text-[13.5px] font-semibold transition-colors",
      isActive(href)
        ? "text-brand"
        : "text-gray-700 hover:text-black"
    );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white",
        scrolled && "shadow-sm border-b border-gray-100"
      )}
    >
      <div className="container h-19 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group">
          <Image
            src="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/05/Logo-png_website.png"
            alt="Transit Education"
            width={200}
            height={54}
            priority
            className="h-14 w-auto transition-transform group-hover:scale-[1.03]"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-0">

              {/* About Us */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={triggerCls(["/about", "/team", "/careers", "/franchise"])}
                >
                  About Us
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-52 gap-1 p-3">
                    {[
                      { title: "About Transit",    href: "/about" },
                      { title: "Our Team",         href: "/team" },
                      { title: "Careers",          href: "/careers" },
                      { title: "Become a Partner", href: "/franchise" },
                    ].map(l => (
                      <li key={l.href}>
                        <NavigationMenuLink
                          render={<Link href={l.href} className={cn(dropdownLinkCls, isActive(l.href) && "text-brand bg-brand/5")} />}
                        >
                          {l.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Study Abroad */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={triggerCls(studyAbroadLinks.map(l => l.href))}
                >
                  Study Abroad
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-96 grid-cols-2 gap-1 p-3">
                    {studyAbroadLinks.map(l => (
                      <li key={l.href}>
                        <NavigationMenuLink
                          render={<Link href={l.href} className={cn(dropdownLinkCls, isActive(l.href) && "text-brand bg-brand/5")} />}
                        >
                          {l.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Student Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={triggerCls(servicesLinks.map(l => l.href))}
                >
                  Student Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-64 gap-1 p-3">
                    {servicesLinks.map(l => (
                      <li key={l.href}>
                        <NavigationMenuLink
                          render={<Link href={l.href} className={cn(dropdownLinkCls, isActive(l.href) && "text-brand bg-brand/5")} />}
                        >
                          {l.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Take Courses */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={triggerCls(coursesLinks.map(l => l.href))}
                >
                  Take Courses
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-52 gap-1 p-3">
                    {coursesLinks.map(l => (
                      <li key={l.href}>
                        <NavigationMenuLink
                          render={<Link href={l.href} className={cn(dropdownLinkCls, isActive(l.href) && "text-brand bg-brand/5")} />}
                        >
                          {l.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Locations */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={triggerCls(locationsLinks.map(l => l.href))}
                >
                  Locations
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-52 gap-1 p-3">
                    {locationsLinks.map(l => (
                      <li key={l.href}>
                        <NavigationMenuLink
                          render={<Link href={l.href} className={cn(dropdownLinkCls, isActive(l.href) && "text-brand bg-brand/5")} />}
                        >
                          {l.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* More — secondary items grouped */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    "text-[13px] font-medium transition-colors",
                    MORE_LINKS.some(l => isActive(l.href))
                      ? "text-brand"
                      : "text-gray-400 hover:text-gray-700"
                  )}
                >
                  More
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-48 gap-1 p-3">
                    {MORE_LINKS.map(l => (
                      <li key={l.href}>
                        <NavigationMenuLink
                          render={<Link href={l.href} className={cn(dropdownLinkCls, isActive(l.href) && "text-brand bg-brand/5")} />}
                        >
                          {l.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/contact"
            className="hidden lg:inline-flex items-center justify-center bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl px-5 py-2.5 transition-colors shadow-sm shadow-brand/20 min-h-11"
          >
            Free Consultation
          </Link>
          <MobileMenu
            studyAbroadLinks={studyAbroadLinks}
            locationsLinks={locationsLinks}
            servicesLinks={servicesLinks}
            coursesLinks={coursesLinks}
          />
        </div>
      </div>
    </header>
  );
}
