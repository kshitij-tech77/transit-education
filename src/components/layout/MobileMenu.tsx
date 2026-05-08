"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface NavLink {
  title: string;
  href: string;
}

interface MobileMenuProps {
  studyAbroadLinks?: NavLink[];
  locationsLinks?: NavLink[];
}

export default function MobileMenu({ 
  studyAbroadLinks = [], 
  locationsLinks = [] 
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button onClick={() => setIsOpen(true)} className="p-2 -mr-2">
        <Menu className="w-6 h-6 text-black" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-[101] shadow-xl p-6 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <img 
                    src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Logo-png_website.png" 
                    alt="Transit Education" 
                    className="h-8 w-auto"
                  />
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-2 -mr-2">
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>

              <nav className="flex-1 flex flex-col gap-4 font-medium text-lg">
                <Link href="/about" onClick={() => setIsOpen(false)}>About Us</Link>
                <div className="pl-4 flex flex-col gap-3 text-base text-gray-600 border-l-2 border-brand-light">
                  <Link href="/team" onClick={() => setIsOpen(false)}>Our Team</Link>
                </div>

                <div className="font-semibold text-brand mt-2 text-sm uppercase tracking-widest">Destinations</div>
                <div className="pl-4 flex flex-col gap-3 text-base text-gray-600 border-l-2 border-brand-light">
                  {studyAbroadLinks.length > 0 ? (
                    studyAbroadLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>{link.title}</Link>
                    ))
                  ) : (
                    <>
                      <Link href="/study-abroad/canada" onClick={() => setIsOpen(false)}>Canada</Link>
                      <Link href="/study-abroad/australia" onClick={() => setIsOpen(false)}>Australia</Link>
                      <Link href="/study-abroad/uk" onClick={() => setIsOpen(false)}>UK</Link>
                      <Link href="/study-abroad/usa" onClick={() => setIsOpen(false)}>USA</Link>
                    </>
                  )}
                </div>
                
                <Link href="/services/admission-counselling" onClick={() => setIsOpen(false)}>Services</Link>
                <Link href="/courses/test-preparation" onClick={() => setIsOpen(false)}>Courses</Link>
                <Link href="/blog" onClick={() => setIsOpen(false)}>Blogs</Link>
                
                <div className="font-semibold text-brand mt-2 text-sm uppercase tracking-widest">Locations</div>
                <div className="pl-4 flex flex-col gap-3 text-base text-gray-600 border-l-2 border-brand-light">
                  {locationsLinks.length > 0 ? (
                    locationsLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>{link.title}</Link>
                    ))
                  ) : (
                    <>
                      <Link href="/locations/kathmandu" onClick={() => setIsOpen(false)}>Kathmandu</Link>
                      <Link href="/locations/itahari" onClick={() => setIsOpen(false)}>Itahari</Link>
                    </>
                  )}
                </div>

                <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
              </nav>

              <div className="mt-8">
                <Link href="/contact" onClick={() => setIsOpen(false)} className={buttonVariants({ className: "w-full bg-brand text-white hover:bg-brand-dark py-6 rounded-lg text-lg" })}>
                  Free Consultation
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
