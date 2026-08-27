import { Metadata } from "next";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read Transit Education's privacy policy. Learn how we collect, use, and protect your personal information when you use our study abroad consultancy services.",
  alternates: { canonical: "https://transiteducation.com.np/privacy" },
};

const EFFECTIVE_DATE = "1 January 2025";
const CONTACT_EMAIL = "info@transiteducation.com.np";
const CONTACT_PHONE = "01-5906277";

export default function PrivacyPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-black py-24 text-white">
        <div className="container">
          <SectionLabel className="text-white border-white/20 bg-white/10">Legal</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg">Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-white">
        <div className="container max-w-3xl">
          <div className="prose-legal">
            <p className="text-gray-600 text-base leading-relaxed mb-10">
              Transit Education ("we", "our", or "us") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights in relation to it.
            </p>

            <LegalSection title="1. Information We Collect">
              <p>We collect information you provide directly, including:</p>
              <ul>
                <li>Name, email address, and phone number when you fill out a consultation or inquiry form</li>
                <li>Academic background, nationality, and study preferences shared during counselling</li>
                <li>Documents you upload (transcripts, passports, SOPs) in connection with visa or admission processing</li>
                <li>Payment information processed securely through third-party payment processors</li>
              </ul>
              <p>We also collect limited technical data automatically (IP address, browser type, pages visited) through cookies and analytics tools to improve our website.</p>
            </LegalSection>

            <LegalSection title="2. How We Use Your Information">
              <ul>
                <li>To provide study abroad counselling, visa guidance, and university admission services</li>
                <li>To communicate with you about your application, inquiries, or events</li>
                <li>To send newsletters and updates (you may unsubscribe at any time)</li>
                <li>To comply with legal obligations, including visa filing requirements</li>
                <li>To improve our website and services through aggregated analytics</li>
              </ul>
            </LegalSection>

            <LegalSection title="3. Information Sharing">
              <p>We do not sell your personal information. We may share it with:</p>
              <ul>
                <li><strong>Partner universities and institutions</strong> where you have applied, for admission purposes</li>
                <li><strong>Visa authorities</strong> as required by law for student visa applications</li>
                <li><strong>Service providers</strong> (hosting, email, analytics) who are contractually bound to protect your data</li>
                <li><strong>Law enforcement</strong> when required by applicable Nepali or international law</li>
              </ul>
            </LegalSection>

            <LegalSection title="4. Data Retention">
              <p>
                We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Application documents are typically retained for 3 years after the conclusion of our engagement with you.
              </p>
            </LegalSection>

            <LegalSection title="5. Cookies">
              <p>
                Our website uses cookies to improve your experience. These include essential cookies (required for site functionality), analytics cookies (Google Analytics), and preference cookies. You may disable non-essential cookies through your browser settings or our cookie consent panel.
              </p>
            </LegalSection>

            <LegalSection title="6. Your Rights">
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal obligations)</li>
                <li>Opt out of marketing communications at any time</li>
              </ul>
              <p>To exercise any of these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand font-semibold hover:underline">{CONTACT_EMAIL}</a>.</p>
            </LegalSection>

            <LegalSection title="7. Security">
              <p>
                We implement industry-standard technical and organisational measures to protect your data. However, no internet transmission is 100% secure. We encourage you to use strong passwords and notify us immediately of any suspected unauthorised access.
              </p>
            </LegalSection>

            <LegalSection title="8. Third-Party Links">
              <p>
                Our website may contain links to third-party sites (university portals, government visa portals). We are not responsible for the privacy practices of those sites. Review their privacy policies before providing any personal information.
              </p>
            </LegalSection>

            <LegalSection title="9. Changes to This Policy">
              <p>
                We may update this policy periodically. The effective date at the top of this page will reflect the most recent revision. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </LegalSection>

            <LegalSection title="10. Contact Us">
              <p>For privacy-related queries:</p>
              <ul>
                <li><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand font-semibold hover:underline">{CONTACT_EMAIL}</a></li>
                <li><strong>Phone:</strong> {CONTACT_PHONE}</li>
                <li><strong>Address:</strong> Purple House, Level 2, Bagbazar, Kathmandu, Nepal</li>
              </ul>
            </LegalSection>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <Link href="/terms" className="text-brand font-semibold hover:underline text-sm">Terms of Service →</Link>
              <Link href="/refund" className="text-brand font-semibold hover:underline text-sm">Refund Policy →</Link>
              <Link href="/contact" className="text-brand font-semibold hover:underline text-sm">Contact Us →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-black mb-4">{title}</h2>
      <div className="text-gray-600 text-base leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-black [&_strong]:font-semibold">
        {children}
      </div>
    </div>
  );
}
