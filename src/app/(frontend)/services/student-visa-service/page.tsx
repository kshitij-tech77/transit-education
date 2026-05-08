import SectionLabel from "@/components/shared/SectionLabel";
import { CheckCircle2, ShieldCheck, FileSearch, Send, MessageSquare, Landmark } from "lucide-react";
import Image from "next/image";

export default function StudentVisaServicePage() {
  const features = [
    {
      title: "Visa Documentation",
      description: "Step-by-step guidance on financial documents, proof of funds, and legal paperwork.",
      icon: <Landmark className="w-6 h-6 text-brand" />,
    },
    {
      title: "Mock Interviews",
      description: "Comprehensive preparation sessions to build your confidence for the visa officer's interview.",
      icon: <MessageSquare className="w-6 h-6 text-brand" />,
    },
    {
      title: "Application Lodgement",
      description: "We assist in the accurate submission of your visa application to the respective embassies.",
      icon: <Send className="w-6 h-6 text-brand" />,
    },
    {
      title: "Health & Insurance",
      description: "Coordination for mandatory health check-ups (IME) and student health insurance (OSHC/UHIP).",
      icon: <ShieldCheck className="w-6 h-6 text-brand" />,
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/happy-young-teenage-lady-holds-her-passport-documents-with-ticket-her-hands-isolated-green-studio-wall-scaled.jpg"
            alt="Student Visa Service"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">Visa Excellence</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              Reliable <span className="text-brand">Student Visa</span> Services
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Achieving your dream of studying abroad starts with a successful visa application. We provide clarity and right guidance throughout the complex process.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel>Our Expertise</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-8">
                Comprehensive Support for Your Visa Journey
              </h2>
              <p className="text-gray-600 leading-relaxed mb-12">
                We guide students through a very detail-oriented, step-by-step process and ensure they are under our supervision throughout the visa process. From acquiring offer letters / I-20s to VISA lodgement, we provide all necessary support.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-black">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/amy-hirschi-JaoVGh5aJ3E-unsplash-scaled.jpg"
                  alt="Visa Guidance"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-[300px]">
                <div className="flex items-center gap-2 text-brand font-bold mb-2">
                  <CheckCircle2 className="w-5 h-5" /> 98% Success Rate
                </div>
                <p className="text-gray-600 text-sm">Our expert guidance ensures your documents are perfect for the embassy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section className="py-24 bg-off-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <SectionLabel>Requirements</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Typical Visa Checklist</h2>
          </div>

          <div className="bg-white rounded-[2rem] p-12 border border-gray-100 shadow-sm">
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {[
                "Valid Passport",
                "Confirmation of Enrollment (COE/I-20)",
                "Academic Transcripts & Certificates",
                "English Proficiency Test Results",
                "Financial Support Documents",
                "Statement of Purpose (SOP)",
                "Medical Clearance (IME)",
                "Visa Application Forms",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="bg-brand rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                Don't Leave Your Visa to Chance
              </h2>
              <p className="text-lg text-white/80 mb-12">
                Get the professional support you need to ensure a smooth and successful visa application.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-brand px-10 py-5 rounded-full font-bold hover:bg-black hover:text-white transition-all shadow-xl"
              >
                Start Your Visa Process
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
