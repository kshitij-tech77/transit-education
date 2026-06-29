import { Metadata } from "next";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Transit Education's study abroad consultancy services in Nepal. Read before engaging our visa, admission, and counselling services.",
  alternates: { canonical: "https://transiteducation.com.np/terms" },
};

const EFFECTIVE_DATE = "1 January 2025";
const CONTACT_EMAIL = "info@transiteducation.com.np";

export default function TermsPage() {
  return (
    <main className="pt-20">
      <section className="bg-black py-20 text-white">
        <div className="container">
          <SectionLabel className="text-white border-white/20 bg-white/10">Legal</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-4">Terms of Service</h1>
          <p className="text-gray-400 text-lg">Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          <div className="prose-legal">
            <p className="text-gray-600 text-base leading-relaxed mb-10">
              Please read these Terms of Service carefully before using the services provided by Transit Education Pvt. Ltd. ("Transit Education", "we", "us", or "our"). By engaging our services you agree to be bound by these terms.
            </p>

            <LegalSection title="1. Services">
              <p>
                Transit Education provides study abroad consultancy services including but not limited to: university selection, admission application support, visa filing assistance, SOP/LOR writing, IELTS/PTE preparation, and pre-departure briefings. All services are provided subject to these terms.
              </p>
            </LegalSection>

            <LegalSection title="2. Client Obligations">
              <ul>
                <li>Provide accurate and complete information, documents, and credentials</li>
                <li>Respond promptly to requests for additional information or documents</li>
                <li>Pay agreed service fees on time according to the payment schedule</li>
                <li>Notify us immediately of any changes to your circumstances, academic background, or application status</li>
              </ul>
              <p>Providing false or misleading information may result in immediate termination of services without refund and may constitute fraud under applicable law.</p>
            </LegalSection>

            <LegalSection title="3. No Guarantee of Admission or Visa">
              <p>
                Transit Education provides expert guidance and support but cannot guarantee university admission or visa approval. Final decisions rest solely with educational institutions and government immigration authorities. We are not liable for any rejection, delay, or adverse outcome in the admission or visa process.
              </p>
            </LegalSection>

            <LegalSection title="4. Fees and Payments">
              <ul>
                <li>Service fees are outlined in the individual service agreement signed with each client</li>
                <li>Consultation fees are non-refundable once the session has been conducted</li>
                <li>Visa filing and documentation fees are governed by our Refund Policy</li>
                <li>University application fees paid directly to institutions are non-refundable by Transit Education</li>
              </ul>
            </LegalSection>

            <LegalSection title="5. Intellectual Property">
              <p>
                All content on this website — including text, graphics, logos, and SOPs prepared by our team — is the intellectual property of Transit Education or licensed to us. You may not reproduce, distribute, or use our content without written permission.
              </p>
            </LegalSection>

            <LegalSection title="6. Limitation of Liability">
              <p>
                To the fullest extent permitted by applicable law, Transit Education shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services, including visa refusals, institutional rejections, travel disruptions, or financial losses.
              </p>
            </LegalSection>

            <LegalSection title="7. Termination">
              <p>
                Either party may terminate the service agreement with 7 days' written notice. We reserve the right to terminate services immediately if a client provides fraudulent information or violates these terms. Fees paid for services already rendered are non-refundable.
              </p>
            </LegalSection>

            <LegalSection title="8. Governing Law">
              <p>
                These terms are governed by the laws of Nepal. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal.
              </p>
            </LegalSection>

            <LegalSection title="9. Changes to Terms">
              <p>
                We may update these terms at any time. The effective date at the top of this page reflects the latest revision. Continued use of our services after changes constitutes acceptance.
              </p>
            </LegalSection>

            <LegalSection title="10. Contact">
              <p>
                For questions about these terms, email <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand font-semibold hover:underline">{CONTACT_EMAIL}</a> or visit any of our four branch offices across Nepal.
              </p>
            </LegalSection>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <Link href="/privacy" className="text-brand font-semibold hover:underline text-sm">Privacy Policy →</Link>
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
