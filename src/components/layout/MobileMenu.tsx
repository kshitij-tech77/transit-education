"use client";

import { useState } from "react";
import { Menu, X, ChevronDown, MapPin, Globe, Info, Briefcase, BookOpen, FileText, Phone, Handshake, ShieldCheck, GraduationCap, MoreHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface NavLink {
  title: string;
  href: string;
}

interface MobileMenuProps {
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
  { title: "Admission Counselling",   href: "/services/admission-counselling" },
  { title: "Student Visa Service",    href: "/services/student-visa-service" },
  { title: "Test Preparation",        href: "/services/test-preparation" },
  { title: "Scholarships Assistance", href: "/services/scholarships-assistance" },
  { title: "SOP Writing Support",     href: "/services/sop-writing" },
  { title: "Compliance Guide",        href: "/compliance" },
];

const DEFAULT_COURSES: NavLink[] = [
  { title: "Test Preparation",  href: "/courses/test-preparation" },
  { title: "Language Training", href: "/courses/language-training" },
];

const DEFAULT_LOCATIONS: NavLink[] = [
  { title: "Kathmandu", href: "/locations/kathmandu" },
  { title: "Itahari",   href: "/locations/itahari" },
  { title: "Damak",     href: "/locations/damak" },
  { title: "Damauli",   href: "/locations/damauli" },
];

const ABOUT_LINKS: NavLink[] = [
  { title: "About Transit",    href: "/about" },
  { title: "Our Team",         href: "/team" },
  { title: "Careers",          href: "/careers" },
  { title: "Become a Partner", href: "/franchise" },
];

const MORE_LINKS: NavLink[] = [
  { title: "Blog",          href: "/blog" },
  { title: "Resources",     href: "/resources" },
  { title: "Student Rewards", href: "/portal/login" },
  { title: "Compliance",    href: "/compliance" },
  { title: "Accreditation", href: "/accreditation" },
];

function Accordion({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-brand/8 flex items-center justify-center group-hover:bg-brand/15 transition-colors">
            <Icon className="w-4 h-4 text-brand" />
          </span>
          <span className="font-semibold text-[15px] text-gray-900">{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="ml-11 mb-2 flex flex-col gap-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 py-3.5 group"
    >
      <span className="w-8 h-8 rounded-xl bg-brand/8 flex items-center justify-center group-hover:bg-brand/15 transition-colors">
        <Icon className="w-4 h-4 text-brand" />
      </span>
      <span className="font-semibold text-[15px] text-gray-900">{label}</span>
    </Link>
  );
}

function SubLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 py-2 px-3 rounded-lg text-[13px] text-gray-600 hover:text-brand hover:bg-brand/5 transition-all font-medium"
    >
      <span className="w-1 h-1 rounded-full bg-brand/50" />
      {label}
    </Link>
  );
}

export default function MobileMenu({
  studyAbroadLinks = DEFAULT_STUDY_ABROAD,
  locationsLinks   = DEFAULT_LOCATIONS,
  servicesLinks    = DEFAULT_SERVICES,
  coursesLinks     = DEFAULT_COURSES,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-800" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 bg-white z-[101] flex flex-col shadow-2xl"
              style={{ width: "min(100vw, 360px)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Link href="/" onClick={close}>
                  <Image
                    src="/logo.png"
                    alt="Transit Education"
                    width={130}
                    height={30}
                    className="h-7 w-auto"
                  />
                </Link>
                <button
                  onClick={close}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4.5 h-4.5 text-gray-700" />
                </button>
              </div>

              {/* Nav — mirrors desktop structure exactly */}
              <nav className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-gray-100/80">
                <Accordion label="About Us" icon={Info}>
                  {ABOUT_LINKS.map((l) => (
                    <SubLink key={l.href} href={l.href} label={l.title} onClick={close} />
                  ))}
                </Accordion>

                <Accordion label="Study Abroad" icon={Globe}>
                  {studyAbroadLinks.map((l) => (
                    <SubLink key={l.href} href={l.href} label={l.title} onClick={close} />
                  ))}
                </Accordion>

                <Accordion label="Student Services" icon={Briefcase}>
                  {servicesLinks.map((l) => (
                    <SubLink key={l.href} href={l.href} label={l.title} onClick={close} />
                  ))}
                </Accordion>

                <Accordion label="Take Courses" icon={BookOpen}>
                  {coursesLinks.map((l) => (
                    <SubLink key={l.href} href={l.href} label={l.title} onClick={close} />
                  ))}
                </Accordion>

                <Accordion label="Locations" icon={MapPin}>
                  {locationsLinks.map((l) => (
                    <SubLink key={l.href} href={l.href} label={l.title} onClick={close} />
                  ))}
                </Accordion>

                <Accordion label="More" icon={MoreHorizontal}>
                  {MORE_LINKS.map((l) => (
                    <SubLink key={l.href} href={l.href} label={l.title} onClick={close} />
                  ))}
                </Accordion>

                <NavItem href="/contact" icon={Phone} label="Contact" onClick={close} />
              </nav>

              {/* Footer CTA */}
              <div className="px-5 py-5 border-t border-gray-100 space-y-3">
                <Link
                  href="/contact"
                  onClick={close}
                  className="w-full bg-brand text-white font-bold text-[14px] py-4 rounded-2xl flex items-center justify-center hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20"
                >
                  Book Free Consultation
                </Link>
                <a
                  href="https://wa.me/9779851315991"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-gray-200 text-gray-700 font-semibold text-[13px] py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:border-brand hover:text-brand transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Us
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
