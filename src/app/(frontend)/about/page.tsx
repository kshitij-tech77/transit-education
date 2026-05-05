import SectionLabel from "@/components/shared/SectionLabel";
import { GraduationCap, Globe2, Target, Heart, Award, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FAQAccordion from "@/components/shared/FAQAccordion";
import { buttonVariants } from "@/components/ui/button";

export default async function AboutPage() {
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('page_path', 'About')
    .eq('status', 'published')
    .order('display_order', { ascending: true });

  const values = [
    {
      title: "Integrity",
      description: "We provide honest, transparent, and ethical guidance to every student, ensuring their future is built on trust.",
      icon: <CheckCircle2 className="w-6 h-6 text-brand" />,
    },
    {
      title: "Excellence",
      description: "We strive for the highest standards in our services, from university selection to visa processing success.",
      icon: <Award className="w-6 h-6 text-brand" />,
    },
    {
      title: "Student-First",
      description: "Every profile is unique. We tailor our consulting to match individual aspirations and career goals.",
      icon: <Heart className="w-6 h-6 text-brand" />,
    },
    {
      title: "Global Reach",
      description: "With partnerships across 50+ top institutions, we open doors to world-class education worldwide.",
      icon: <Globe2 className="w-6 h-6 text-brand" />,
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/media/2021/05/amy-hirschi-JaoVGh5aJ3E-unsplash-scaled.jpg"
            alt="About Transit Education"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">About Us</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              Empowering Dreams Through <span className="text-brand">Global Education</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Transit Education is a progressive and professional education consultancy comprised of a full-fledged team of dedicated professionals with years of experience in education, consulting and management in Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src="/media/2021/04/lets-plan.png"
                  alt="Our Mission"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-brand p-8 rounded-3xl text-white shadow-xl hidden md:block max-w-[280px]">
                <p className="text-2xl font-bold mb-1">10+ Years</p>
                <p className="text-sm opacity-90 text-white font-medium">Of dedicated service in international education consulting.</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <SectionLabel>Our Story</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-6">
                  A Legacy of Trust and Excellence
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Representing more than 50 top education institutions from different parts of the world (including Canada, Australia, New Zealand, and Europe), we are fully equipped with all the amenities to serve our students with international standards.
                  </p>
                  <p>
                    At Transit, we strive for excellence, supporting students to use their talents best while taking them closer to the best educational opportunities worldwide. We believe that every individual is unique in their abilities, and so we assess every profile wisely for them to reach their full potential.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="p-6 bg-off-white rounded-2xl border border-gray-100">
                  <Target className="w-10 h-10 text-brand mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">Our Mission</h3>
                  <p className="text-gray-600 text-sm">
                    To bridge the gap between ambitious students and world-class educational institutions through expert, honest guidance.
                  </p>
                </div>
                <div className="p-6 bg-off-white rounded-2xl border border-gray-100">
                  <GraduationCap className="w-10 h-10 text-brand mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">Our Vision</h3>
                  <p className="text-gray-600 text-sm">
                    To be Nepal's most trusted partner in international education, recognized for our integrity and student success.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Our Values</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mt-4">
              The Principles That Guide Us
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <SectionLabel>FAQ</SectionLabel>
                <h2 className="text-3xl font-bold text-black mt-4">Questions about Transit?</h2>
              </div>
              <div className="bg-off-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
                <FAQAccordion items={faqs.map(f => ({ ...f, featured: f.is_featured }))} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="bg-brand rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                Ready to Start Your Global Journey?
              </h2>
              <p className="text-lg text-white/80 mb-12">
                Join thousands of successful students who found their transit to success with us. Book a free consultation today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/contact" 
                  className={buttonVariants({ variant: "brand", size: "lg", className: "px-12 py-5 rounded-full bg-white text-brand hover:bg-black hover:text-white" })}
                >
                  Book Free Consultation
                </Link>
                <Link 
                  href="/study-abroad" 
                  className={buttonVariants({ size: "lg", className: "bg-black/20 backdrop-blur-md text-white border border-white/30 px-12 py-5 rounded-full hover:bg-white/10" })}
                >
                  Explore Destinations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

