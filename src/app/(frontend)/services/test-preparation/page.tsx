import SectionLabel from "@/components/shared/SectionLabel";
import { BookOpen, Headphones, Languages, PenTool, GraduationCap, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function TestPreparationPage() {
  const courses = [
    {
      name: "IELTS",
      description: "International English Language Testing System. The most popular choice for Australia, Canada, and the UK.",
      features: ["Certified Instructors", "Daily Mock Tests", "Updated Materials"],
      icon: <Languages className="w-8 h-8" />,
    },
    {
      name: "PTE Academic",
      description: "Pearson Test of English. Computer-based test accepted widely for study and migration.",
      features: ["State-of-the-art Lab", "AI Scoring Logic", "Intensive Practice"],
      icon: <PenTool className="w-8 h-8" />,
    },
    {
      name: "TOEFL iBT",
      description: "Test of English as a Foreign Language. Primarily for US and Canadian universities.",
      features: ["Listening Labs", "Speaking Clinics", "Full Simulation"],
      icon: <Headphones className="w-8 h-8" />,
    },
    {
      name: "SAT",
      description: "Scholastic Assessment Test. For undergraduate admissions in the USA and other countries.",
      features: ["Math Specialists", "Verbal Mastery", "Strategy Sessions"],
      icon: <BookOpen className="w-8 h-8" />,
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/clay-banks-GX8KBbVmC6c-unsplash-scaled.jpg"
            alt="Test Preparation"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">Academy Excellence</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              Score Higher with Our <span className="text-brand">Test Prep</span> Classes
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We provide everything necessary for a student planning to study abroad including world-class preparation for IELTS, PTE, TOEFL, and SAT.
            </p>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>Our Courses</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Expert Coaching for Global Success</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {courses.map((course, index) => (
              <div key={index} className="bg-off-white p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all duration-500 group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                    {course.icon}
                  </div>
                  <div className="text-sm font-bold text-gray-400">0{index + 1}</div>
                </div>
                <h3 className="text-3xl font-bold text-black mb-4">{course.name}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">{course.description}</p>
                <div className="space-y-3">
                  {course.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-brand" /> {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <Image
            src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Logo-png_website.png"
            alt="Pattern"
            width={400}
            height={400}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] rounded-[3rem] overflow-hidden">
              <Image
                src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/student-library-books-3500990.jpg"
                alt="State of the art classroom"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="space-y-8">
              <SectionLabel className="text-white border-white/20 bg-white/10">The Transit Advantage</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold">Why Prepare with Us?</h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Experienced Faculty",
                    text: "Our faculty members are first-hand test takers who guide you to reach your full potential.",
                  },
                  {
                    title: "State-of-the-Art Facilities",
                    text: "Modern classrooms and dedicated computer labs for a seamless learning experience.",
                  },
                  {
                    title: "Comprehensive Resources",
                    text: "Access to extensive library of practice materials, official guides, and mock tests.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1.5 h-12 bg-brand shrink-0" />
                    <div>
                      <h4 className="font-bold text-xl mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="bg-off-white rounded-[3rem] p-12 md:p-20 text-center relative border border-gray-100 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-8">
                Ready to Achieve Your Target Score?
              </h2>
              <p className="text-gray-600 mb-12">
                Join our next batch and take the first step towards your global education. Free orientation class available every Sunday.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="/contact" 
                  className="bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all shadow-lg"
                >
                  Join Next Batch
                </a>
                <a 
                  href="/contact" 
                  className="bg-white text-black border border-gray-200 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all"
                >
                  Book Free Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
