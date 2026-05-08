import SectionLabel from "@/components/shared/SectionLabel";
import { CheckCircle2, GraduationCap, ClipboardCheck, Search, Users2, FileText } from "lucide-react";
import Image from "next/image";

export default function AdmissionCounsellingPage() {
  const processSteps = [
    {
      title: "Profile Evaluation",
      description: "We analyze your academic background, test scores, and career goals to identify the best opportunities.",
      icon: <Users2 className="w-6 h-6" />,
    },
    {
      title: "University Selection",
      description: "Choosing from our 50+ partner institutions to find the perfect match for your budget and aspirations.",
      icon: <Search className="w-6 h-6" />,
    },
    {
      title: "Document Preparation",
      description: "Expert guidance on SOPs, LORs, and CVs to ensure your application stands out from the crowd.",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "Application Submission",
      description: "We handle the entire application process, ensuring all deadlines are met with accurate documentation.",
      icon: <ClipboardCheck className="w-6 h-6" />,
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/neonbrand-y_6rqStQBYQ-unsplash-scaled.jpg"
            alt="Admission Counselling"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">Expert Guidance</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              Personalized <span className="text-brand">Admission Counselling</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              From choosing the right match destination to picking the perfect institution for you. We guide you through every step of your application journey.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div>
                <SectionLabel>The Process</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-6">
                  How We Navigate Your Admissions
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Whether you are applying for a Bachelor's, Master's or PhD degree program, the application process could often be tedious and time-consuming. Meeting deadline is not the only thing to be concerned about but also submitting accurate documents, SOPs, etc. is a must.
                </p>
              </div>

              <div className="space-y-6">
                {processSteps.map((step, index) => (
                  <div key={index} className="flex gap-6 p-6 rounded-3xl bg-off-white border border-gray-100 hover:border-brand/20 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0 group-hover:bg-brand group-hover:text-white transition-all">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky top-32">
              <div className="relative h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl mb-8">
                <Image
                  src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/paper-business-finance-3309829.jpg"
                  alt="Documentation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-brand p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <h3 className="text-2xl font-bold mb-4">Start Your Application</h3>
                <p className="text-white/80 mb-8 text-sm leading-relaxed">
                  Don't let complex application forms hold you back. Our expert counsellors are ready to help you secure your spot at a top global institution.
                </p>
                <a 
                  href="/contact" 
                  className="inline-block bg-white text-brand px-8 py-4 rounded-full font-bold hover:bg-black hover:text-white transition-all"
                >
                  Book Free Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Transit Section */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>Why Transit?</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Benefits of Expert Counselling</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Higher Success Rate",
                text: "Our deep understanding of university requirements significantly increases your chances of acceptance.",
                icon: <CheckCircle2 className="w-8 h-8 text-brand" />,
              },
              {
                title: "Scholarship Guidance",
                text: "We identify grant and scholarship opportunities that match your academic profile to reduce your financial burden.",
                icon: <GraduationCap className="w-8 h-8 text-brand" />,
              },
              {
                title: "Stress-Free Journey",
                text: "We handle the paperwork and follow-ups, letting you focus on preparing for your global education journey.",
                icon: <CheckCircle2 className="w-8 h-8 text-brand" />,
              },
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="flex justify-center mb-6">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-black mb-4">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
