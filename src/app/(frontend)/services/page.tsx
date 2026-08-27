import SectionLabel from "@/components/shared/SectionLabel";
import Link from "next/link";
import { GraduationCap, ShieldCheck, BookOpen, ScrollText, Languages, ArrowRight } from "lucide-react";
import ProcessSteps from "@/components/shared/ProcessSteps";
import { buttonVariants } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Abroad Services | Transit Education Nepal",
  description: "Expert admission counselling, student visa processing, IELTS/PTE preparation, and scholarship assistance for Nepali students going abroad.",
  alternates: { canonical: "https://transiteducation.com.np/services" },
  openGraph: {
    title: "Study Abroad Services | Transit Education Nepal",
    description: "Admission counselling, student visa service, scholarship assistance, and test preparation — all under one roof in Nepal.",
    url: "https://transiteducation.com.np/services",
    type: "website",
  },
};

export default function ServicesPage() {
  const services = [
    {
      title: "Admission Counselling",
      description: "Expert guidance in selecting the right course and university based on your academic profile and career goals.",
      icon: <GraduationCap className="w-12 h-12 text-brand" />,
      link: "/services/admission-counselling"
    },
    {
      title: "Student Visa Service",
      description: "Step-by-step assistance with visa documentation and interview preparation to ensure high success rates.",
      icon: <ShieldCheck className="w-12 h-12 text-brand" />,
      link: "/services/student-visa-service"
    },
    {
      title: "Test Preparation",
      description: "Expert coaching for IELTS, PTE, and TOEFL with proven strategies to achieve your target scores.",
      icon: <BookOpen className="w-12 h-12 text-brand" />,
      link: "/services/test-preparation"
    },
    {
      title: "Scholarships Assistance",
      description: "Helping you identify and apply for financial aid and scholarships offered by global institutions.",
      icon: <ScrollText className="w-12 h-12 text-brand" />,
      link: "/services/scholarships-assistance"
    },
    {
      title: "Language Training",
      description: "Comprehensive language programs designed to improve your communication skills for life abroad.",
      icon: <Languages className="w-12 h-12 text-brand" />,
      link: "/courses/language-training"
    }
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-black pt-32 pb-24 md:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/04/lets-plan.webp')] bg-cover bg-center" />
        <div className="container relative z-10 text-center">
          <SectionLabel className="text-white border-white/20 bg-white/10 mx-auto">Our Services</SectionLabel>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8">
            Comprehensive <span className="text-brand">Support</span> for Your Journey
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            From initial counselling to post-departure support, we provide everything you need to succeed internationally.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group bg-off-white p-12 rounded-3xl border border-gray-100 hover:border-brand/20 transition-all hover:shadow-xl hover:shadow-brand/5"
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-brand transition-colors">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {service.description}
                </p>
                <Link 
                  href={service.link} 
                  className="inline-flex items-center gap-2 text-brand font-bold group-hover:gap-3 transition-all"
                >
                  Learn More <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProcessSteps />

      {/* Experience CTA */}
      <section className="py-24 bg-off-white">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-8 leading-tight">
              10+ Years of Excellence in Education Consulting
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              Our experienced consultants have helped thousands of students secure admissions and visas for top destinations worldwide. Let us help you navigate your future.
            </p>
            <Link 
              href="/contact" 
              className={buttonVariants({ variant: "brand", size: "lg", className: "px-12 py-5 rounded-full" })}
            >
              Book Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
