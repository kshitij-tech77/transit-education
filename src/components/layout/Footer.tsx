import Link from "next/link";
import { MessageCircle } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function Footer({ settings }: { settings?: any }) {
  const socialLinks = {
    facebook: settings?.facebook_url || "https://facebook.com/transiteducation",
    instagram: settings?.instagram_url || "https://instagram.com/transiteducation",
    linkedin: settings?.linkedin_url || "https://linkedin.com/company/transiteducation",
    tiktok: settings?.tiktok_url || "",
    whatsapp: settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}` : "https://wa.me/9779851315991"
  };

  return (
    <footer className="bg-[#111111] text-[#9A9895] pt-20 pb-8 mt-auto">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Column 1 */}
        <div>
          <Link href="/" className="inline-block mb-6">
            <img
              src="/logo.png"
              alt={settings?.site_name || "Transit Education"}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <p className="mb-6 text-sm leading-relaxed">{settings?.tagline || "Nepal's most trusted study abroad consultancy. Guiding students since 2015."}</p>
          <div className="space-y-4 text-sm">
            <div>
              <strong className="text-white block mb-1">Kathmandu (HQ)</strong>
              <p>Purple House, Level 2, Bagbazar, Kathmandu</p>
              <p>{settings?.phone || "01-5906277"}</p>
              <p>{settings?.email || "info@transiteducation.com.np"}</p>
            </div>
            <div>
              <strong className="text-white block mb-1">Branches</strong>
              <p>Itahari | Damak | Damauli</p>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-white font-bold mb-6">Our Services</h4>
          {/* Fix #15 — padding: 8px 0 on all footer anchor elements for 44px touch target */}
          <ul className="flex flex-col text-sm">
            <li><Link href="/services/admission-counselling" className="block py-2 hover:text-white transition-colors">Admission Counselling</Link></li>
            <li><Link href="/services/student-visa-service" className="block py-2 hover:text-white transition-colors">Student Visa Service</Link></li>
            <li><Link href="/services/test-preparation" className="block py-2 hover:text-white transition-colors">Test Preparation</Link></li>
            <li><Link href="/services/scholarships-assistance" className="block py-2 hover:text-white transition-colors">Scholarships Assistance</Link></li>
            <li><Link href="/services/sop-writing" className="block py-2 hover:text-white transition-colors">SOP Writing Support</Link></li>
            <li><Link href="/courses/language-training" className="block py-2 hover:text-white transition-colors">Language Training</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="flex flex-col text-sm">
            <li><Link href="/careers" className="block py-2 hover:text-white transition-colors">Careers</Link></li>
            <li><Link href="/franchise" className="block py-2 hover:text-white transition-colors">Become a Partner</Link></li>
            <li><Link href="/portal/login" className="block py-2 hover:text-white transition-colors">Student Rewards</Link></li>
            <li><Link href="/tools" className="block py-2 hover:text-white transition-colors">Free Tools & Calculators</Link></li>
            <li><a href="https://www.xe.com/currencyconverter/" rel="noopener nofollow" target="_blank" className="block py-2 hover:text-white transition-colors">Currency Converter</a></li>
            <li><a href="https://www.timeanddate.com/date/duration.html" rel="noopener nofollow" target="_blank" className="block py-2 hover:text-white transition-colors">Date Converter</a></li>
            <li><a href="https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests" rel="noopener nofollow" target="_blank" className="block py-2 hover:text-white transition-colors">Free IELTS Mock Test</a></li>
            <li><a href="https://www.pearsonpte.com/preparation" rel="noopener nofollow" target="_blank" className="block py-2 hover:text-white transition-colors">Free PTE Mock Test</a></li>
            <li><a href="https://www.timeanddate.com/worldclock/" rel="noopener nofollow" target="_blank" className="block py-2 hover:text-white transition-colors">World Time</a></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h4 className="text-white font-bold mb-6">Stay in Touch</h4>
          <p className="text-sm mb-6 leading-relaxed">Follow us for latest visa updates, scholarship news, and events.</p>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#9A9895] hover:bg-brand hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#9A9895] hover:bg-brand hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#9A9895] hover:bg-brand hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#9A9895] hover:bg-brand hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08z"/></svg>
              </a>
            )}
          </div>
          <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
          <NewsletterForm />
        </div>
      </div>

      <div className="container pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#6B6966]">
        <p>© {new Date().getFullYear()} {settings?.site_name || "Transit Education"}. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="block py-2 hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="block py-2 hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/refund" className="block py-2 hover:text-white transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
