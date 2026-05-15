import SectionLabel from "@/components/shared/SectionLabel";
import { BookOpen, Headphones, Languages, PenTool, CheckCircle2, Clock, Users2 } from "lucide-react";
import Image from "next/image";

export default function TestPrepCoursePage() {
  const courseDetails = [
    {
      title: "IELTS Coaching",
      subtitle: "Academic & General Training",
      duration: "6 Weeks",
      size: "Max 15 Students",
      features: ["Full length mock tests every Sunday", "Individual speaking sessions", "Updated Cambridge materials"],
      icon: <Languages className="w-6 h-6 text-brand" />,
    },
    {
      title: "PTE Academic",
      subtitle: "Pearson Test of English",
      duration: "4 Weeks",
      size: "Max 10 Students",
      features: ["Computer-based lab practice", "AI scoring simulation", "Fast track batches available"],
      icon: <PenTool className="w-6 h-6 text-brand" />,
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/student-library-books-3500990.jpg"
            alt="Test Preparation Courses"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <SectionLabel className="text-white border-white/20 bg-white/10">Academic Excellence</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8 leading-tight">
              Excel in Your <span className="text-brand">Proficiency Tests</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Our expert instructors and comprehensive curriculum are designed to help you achieve your target scores in the very first attempt.
            </p>
          </div>
        </div>
      </section>

      {/* Course Cards */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>Course Syllabus</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Structured Learning Paths</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {courseDetails.map((course, index) => (
              <div key={index} className="bg-off-white p-12 rounded-[3rem] border border-gray-100 hover:shadow-xl transition-all duration-500">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand">
                    {course.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black">{course.title}</h3>
                    <p className="text-brand font-medium text-sm">{course.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/50 p-4 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">
                      <Clock className="w-3 h-3" /> Duration
                    </div>
                    <p className="text-black font-bold">{course.duration}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">
                      <Users2 className="w-3 h-3" /> Batch Size
                    </div>
                    <p className="text-black font-bold">{course.size}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  {course.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <a 
                  href="/contact" 
                  className="block w-full py-4 text-center bg-black text-white rounded-2xl font-bold hover:bg-brand transition-all shadow-lg"
                >
                  Check Available Batches
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <SectionLabel>Classroom Experience</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-black">Why Choose Transit Academy?</h2>
              <p className="text-gray-600 leading-relaxed">
                We believe that the right environment is key to learning. Our academy provides students with all the tools they need to succeed.
              </p>
              
              <div className="grid gap-6">
                {[
                  { title: "Smart Classrooms", text: "Interactive learning with digital tools and multimedia resources." },
                  { title: "Computer Lab", text: "Dedicated lab for PTE practice and listening test simulations." },
                  { title: "Library Access", text: "Borrow the latest test prep books and official practice guides." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-1.5 h-full bg-brand rounded-full" />
                    <div>
                      <h4 className="font-bold text-black mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/03/annie-spratt-pbrQvuKJQf8-unsplash-scaled.jpg"
                alt="Transit Academy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
