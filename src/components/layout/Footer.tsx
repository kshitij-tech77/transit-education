import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 pt-20 pb-8 mt-auto">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Column 1 */}
        <div>
          <h3 className="text-white font-bold text-xl mb-6">Transit<span className="text-brand">.</span></h3>
          <p className="mb-6 text-sm">Nepal's most trusted study abroad consultancy. Guiding students since 2015.</p>
          <div className="space-y-4 text-sm">
            <div>
              <strong className="text-white block mb-1">Kathmandu (HQ)</strong>
              <p>Putalisadak, Kathmandu</p>
              <p>(+977) 9851315991</p>
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
          <ul className="space-y-3 text-sm flex flex-col">
            <Link href="/services/admission-counselling" className="hover:text-brand transition-colors">Admission Counselling</Link>
            <Link href="/services/student-visa-service" className="hover:text-brand transition-colors">Student Visa Service</Link>
            <Link href="/services/test-preparation" className="hover:text-brand transition-colors">Test Preparation</Link>
            <Link href="/services/scholarships-assistance" className="hover:text-brand transition-colors">Scholarships Assistance</Link>
            <Link href="/courses/language-training" className="hover:text-brand transition-colors">Language Training</Link>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="space-y-3 text-sm flex flex-col">
            <a href="https://www.xe.com/currencyconverter/" rel="noopener nofollow" target="_blank" className="hover:text-brand transition-colors">Currency Converter</a>
            <a href="https://www.timeanddate.com/date/duration.html" rel="noopener nofollow" target="_blank" className="hover:text-brand transition-colors">Date Converter</a>
            <a href="https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests" rel="noopener nofollow" target="_blank" className="hover:text-brand transition-colors">Free IELTS Mock Test</a>
            <a href="https://www.pearsonpte.com/preparation" rel="noopener nofollow" target="_blank" className="hover:text-brand transition-colors">Free PTE Mock Test</a>
            <a href="https://www.timeanddate.com/worldclock/" rel="noopener nofollow" target="_blank" className="hover:text-brand transition-colors">World Time</a>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h4 className="text-white font-bold mb-6">Stay in Touch</h4>
          <p className="text-sm mb-6">Follow us for latest visa updates, scholarship news, and events.</p>
          <div className="flex items-center gap-4 mb-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-brand transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-brand transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
          <a href="https://wa.me/9779851315991" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="container pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>© {new Date().getFullYear()} Transit Education. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
