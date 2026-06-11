import { Metadata } from "next";
import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | Transit Education Nepal",
  description: "Transit Education's refund and cancellation policy for study abroad consultancy, visa assistance, and IELTS/PTE preparation services in Nepal.",
  alternates: { canonical: "https://transiteducation.com.np/refund" },
};

const EFFECTIVE_DATE = "1 January 2025";
const CONTACT_EMAIL = "info@transiteducation.com.np";

const REFUNDABLE = [
  "Service fees paid in advance where Transit Education cancels the service",
  "Duplicate payments made in error — verified and refunded within 7 business days",
  "Partial service fees where a specific deliverable was not provided as agreed",
];

const NON_REFUNDABLE = [
  "University application fees forwarded to institutions on your behalf",
  "Consultation session fees once the session has been conducted",
  "Visa filing fees once documents have been submitted to an immigration authority",
  "IELTS/PTE test registration fees forwarded to British Council or Pearson",
  "Service fees for completed work, including SOP writing and document preparation",
];

export default function RefundPage() {
  return (
    <main className="pt-20">
      <section className="bg-black py-20 text-white">
        <div className="container">
          <SectionLabel className="text-white border-white/20 bg-white/10">Legal</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-4">Refund Policy</h1>
          <p className="text-gray-400 text-lg">Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          <p className="text-gray-600 text-base leading-relaxed mb-10">
            Transit Education strives to provide high-quality services to every student. This policy outlines when refunds are available and how to request one.
          </p>

          {/* Quick reference cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                <h3 className="font-bold text-green-800 text-lg">Eligible for Refund</h3>
              </div>
              <ul className="space-y-2">
                {REFUNDABLE.map((item, i) => (
                  <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                <h3 className="font-bold text-red-800 text-lg">Non-Refundable</h3>
              </div>
              <ul className="space-y-2">
                {NON_REFUNDABLE.map((item, i) => (
                  <li key={i} className="text-red-700 text-sm flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="prose-legal">
            <LegalSection title="Refund Request Process">
              <p>To request a refund:</p>
              <ol>
                <li>Email <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand font-semibold hover:underline">{CONTACT_EMAIL}</a> with subject line "Refund Request – [Your Full Name]"</li>
                <li>Include your service agreement number, payment receipt, and a brief description of the reason for your request</li>
                <li>Our team will review your request within 5–7 business days and respond with a decision</li>
                <li>Approved refunds are processed within 10–14 business days to the original payment method</li>
              </ol>
            </LegalSection>

            <LegalSection title="Visa Rejection Policy">
              <p>
                A student visa rejection is not grounds for a refund of our service fees. Transit Education provides guidance and file preparation — ultimate visa decisions rest with immigration authorities. We do, however, offer a complimentary file review and reapplication support in the event of a visa refusal, subject to our assessment of the case.
              </p>
            </LegalSection>

            <LegalSection title="Cancellation by Transit Education">
              <p>
                If Transit Education cancels an agreed service before delivery (e.g., a scheduled workshop or training programme), affected clients will receive a full refund of fees paid for that specific service within 7 business days.
              </p>
            </LegalSection>

            <LegalSection title="Disputes">
              <p>
                If you are unsatisfied with our response to a refund request, you may escalate the matter to our management team at <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand font-semibold hover:underline">{CONTACT_EMAIL}</a>. We are committed to resolving all disputes fairly and promptly.
              </p>
            </LegalSection>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <Link href="/privacy" className="text-brand font-semibold hover:underline text-sm">Privacy Policy →</Link>
              <Link href="/terms" className="text-brand font-semibold hover:underline text-sm">Terms of Service →</Link>
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
      <div className="text-gray-600 text-base leading-relaxed space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_strong]:text-black [&_strong]:font-semibold">
        {children}
      </div>
    </div>
  );
}
