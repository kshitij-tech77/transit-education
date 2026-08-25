import SectionLabel from "@/components/shared/SectionLabel";
import { CheckCircle2, MessageSquare, Globe2, BookOpen, Users2, Clock } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "English Language Training in Nepal | Transit Education",
  description: "Build English fluency for academic and professional success. Language training courses at Transit Education designed for Nepali students planning to study abroad.",
  alternates: { canonical: "https://transiteducation.com.np/courses/language-training" },
  openGraph: {
    title: "English Language Training | Transit Education Nepal",
    description: "Structured English language courses to prepare you for university study abroad — listening, speaking, reading, and writing.",
    url: "https://transiteducation.com.np/courses/language-training",
    type: "website",
  },
};

export default function LanguageTrainingPage() {
  const languages = [
    {
      name: "Basic English",
      description: "Improve your foundation in English grammar, vocabulary, and sentence structure.",
      duration: "8 Weeks",
      level: "Beginner",
      icon: <BookOpen className="w-6 h-6 text-brand" />,
    },
    {
      name: "Spoken English",
      description: "Enhance your fluency and confidence in everyday conversations and public speaking.",
      duration: "6 Weeks",
      level: "Intermediate",
      icon: <MessageSquare className="w-6 h-6 text-brand" />,
    },
    {
      name: "Advanced Business English",
      description: "Master professional communication for business, interviews, and academic writing.",
      duration: "10 Weeks",
      level: "Advanced",
      icon: <Globe2 className="w-6 h-6 text-brand" />,
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/03/annie-spratt-pbrQvuKJQf8-unsplash-scaled.jpg"
            alt="Language Training"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">Communication Skills</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              Master the <span className="text-brand">Global Language</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Unlock global opportunities with our comprehensive language training programs. We help you communicate with confidence and clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Course List */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel>Our Programs</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-8">
                Tailored Courses for Every Level
              </h2>
              <div className="space-y-6">
                {languages.map((lang, index) => (
                  <div key={index} className="flex gap-6 p-8 rounded-[2rem] bg-off-white border border-gray-100 hover:border-brand/20 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-brand group-hover:text-white transition-all">
                      {lang.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">{lang.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{lang.description}</p>
                      <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lang.duration}</span>
                        <span className="flex items-center gap-1"><Users2 className="w-3 h-3" /> {lang.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/xgpct4gs/image/upload/media/2021/03/woman-laptop-business-3190829.jpg"
                  alt="Learning English"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -top-10 -right-10 bg-brand text-white p-10 rounded-3xl shadow-xl max-w-[280px]">
                <h4 className="text-2xl font-bold mb-2">Interactive Learning</h4>
                <p className="text-white/80 text-sm">Focus on practical usage, pronunciation, and confidence building through interactive sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>How we teach</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Our Training Methodology</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Conversation Based", text: "We focus on real-world communication rather than just memorizing rules." },
              { title: "Small Batch Sizes", text: "Personalized attention ensured with limited students per session." },
              { title: "Expert Feedback", text: "Regular assessment and constructive feedback to track your progress." },
            ].map((item, index) => (
              <div key={index} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-brand mb-6" />
                <h3 className="text-xl font-bold text-black mb-4">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
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
                Enhance Your Global Communication
              </h2>
              <p className="text-lg text-white/80 mb-12">
                Sign up for a free assessment test today and find the perfect course level for you.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-brand px-10 py-5 rounded-full font-bold hover:bg-black hover:text-white transition-all shadow-xl"
              >
                Enroll Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
