import SectionLabel from "@/components/shared/SectionLabel";
import ContactPageClient from "@/components/contact/ContactPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Transit Education | 4 Branches Across Nepal",
  description: "Visit or call any of our 4 branches — Kathmandu, Itahari, Damak, Damauli. Free counselling for study abroad in Canada, Australia, UK, USA & more.",
  alternates: { canonical: "https://transiteducation.com.np/contact" },
  openGraph: {
    title: "Contact Transit Education | 4 Branches Across Nepal",
    description: "Free counselling at Kathmandu (Bagbazar), Itahari, Damak, and Damauli. Expert guidance for student visas and university admissions.",
    url: "https://transiteducation.com.np/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="pt-20">
      <section className="bg-black pt-32 pb-24 md:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/04/lets-plan.png')] bg-cover bg-center" />
        <div className="container relative z-10 text-center">
          <SectionLabel className="text-white border-white/20 bg-white/10 mx-auto">Get in Touch</SectionLabel>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8">
            Contact <span className="text-brand">Transit Education</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            4 branches across Nepal. Pick yours and we'll connect you instantly.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container">
          <ContactPageClient />
        </div>
      </section>

      <section className="h-125 w-full bg-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.4829241908044!2d85.32168931506191!3d27.702302982793264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1907b22a0001%3A0x6b876d750a9840!2sTransit%20Education%20Network!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
        />
      </section>
    </main>
  );
}
