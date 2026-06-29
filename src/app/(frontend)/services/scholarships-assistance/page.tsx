import SectionLabel from "@/components/shared/SectionLabel";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { GraduationCap, Award, Landmark, TrendingUp, CheckCircle2, HeartHandshake } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scholarships Assistance for Nepali Students",
  description: "Find and apply for merit-based and need-based scholarships at top universities in Canada, Australia, UK, and USA. Expert guidance from Transit Education Nepal.",
  alternates: { canonical: "https://transiteducation.com.np/services/scholarships-assistance" },
  openGraph: {
    title: "Scholarships Assistance | Transit Education Nepal",
    description: "We identify scholarship opportunities at 50+ partner institutions and help Nepali students submit strong applications.",
    url: "https://transiteducation.com.np/services/scholarships-assistance",
    type: "website",
  },
};

export default function ScholarshipsAssistancePage() {
  const types = [
    {
      title: "Merit-Based",
      description: "Awards for students with exceptional academic records, test scores, or artistic talents.",
      icon: <Award className="w-8 h-8 text-brand" />,
    },
    {
      title: "Need-Based",
      description: "Financial aid provided based on the student's family income and financial situation.",
      icon: <Landmark className="w-8 h-8 text-brand" />,
    },
    {
      title: "Country-Specific",
      description: "Exclusive grants offered by governments or institutions for students from Nepal.",
      icon: <TrendingUp className="w-8 h-8 text-brand" />,
    },
    {
      title: "Bursaries & Grants",
      description: "One-time financial awards to assist with tuition or living expenses.",
      icon: <HeartHandshake className="w-8 h-8 text-brand" />,
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/micheile-henderson-ZVprbBmT8QA-unsplash-scaled.jpg"
            alt="Scholarships Assistance"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <Breadcrumb items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services/scholarships-assistance" },
            { label: "Scholarships Assistance" },
          ]} />
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">Financial Support</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              Unlock <span className="text-brand">Scholarship</span> Opportunities
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We help deserving students identify and secure various kinds of scholarship programs, grants, bursaries, and financial awards to make global education affordable.
            </p>
          </div>
        </div>
      </section>

      {/* Scholarship Types */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/young-student-woman-looking-her-world-globe-sitting-cloud-scaled.jpg"
                alt="Scholarship Opportunities"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <p className="text-4xl font-bold mb-2">500+</p>
                <p className="text-sm font-medium opacity-80">Students assisted with scholarships</p>
              </div>
            </div>

            <div>
              <SectionLabel>Our Services</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-8">
                Types of Financial Aid We Assist With
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {types.map((type, index) => (
                  <div key={index} className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
                      {type.icon}
                    </div>
                    <h3 className="text-xl font-bold text-black">{type.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Steps */}
      <section className="py-24 bg-off-white">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <SectionLabel>Our Method</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Maximizing Your Funding Potential</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Grant Identification",
                text: "We scout for specific grants and scholarships that match your profile across 50+ partner universities.",
              },
              {
                step: "02",
                title: "Strategic Application",
                text: "Assistance in writing compelling scholarship essays and preparing strong financial documentation.",
              },
              {
                step: "03",
                title: "University Negotiation",
                text: "Leveraging our relationships with institutions to advocate for maximum financial support for our students.",
              },
            ].map((step, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-6xl font-black text-gray-50 group-hover:text-brand/5 transition-colors">
                  {step.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-black mb-4">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="bg-brand rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                Don't Let Budget Stop Your Dreams
              </h2>
              <p className="text-lg text-white/80 mb-12">
                Our experts are dedicated to finding the right financial path for your education. Book your scholarship consultation now.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-brand px-10 py-5 rounded-full font-bold hover:bg-black hover:text-white transition-all shadow-xl"
              >
                Apply for Scholarships
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
