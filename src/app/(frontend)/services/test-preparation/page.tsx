import SectionLabel from "@/components/shared/SectionLabel";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { BookOpen, Headphones, Languages, PenTool, Clock, Users, CalendarDays, CheckCircle2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IELTS & PTE Test Preparation in Nepal",
  description: "Expert IELTS, PTE Academic, and TOEFL coaching at Transit Education Nepal. Proven strategies, mock tests, and personalised feedback to hit your target band score.",
  alternates: { canonical: "https://transiteducation.com.np/services/test-preparation" },
  openGraph: {
    title: "IELTS & PTE Test Preparation | Transit Education Nepal",
    description: "Structured IELTS, PTE, and TOEFL prep with experienced trainers. Join hundreds of students who achieved their target scores.",
    url: "https://transiteducation.com.np/services/test-preparation",
    type: "website",
  },
};

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
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="container relative z-10">
          <Breadcrumb items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services/test-preparation" },
            { label: "Test Preparation" },
          ]} />
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

      {/* Class Schedule & Pricing */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>Batch Schedule</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Find the Right Batch for You</h2>
            <p className="text-gray-600 mt-4">Flexible timings for working professionals, college students, and school leavers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                batch: "Morning Batch",
                time: "6:30 AM – 9:30 AM",
                days: "Sunday – Friday",
                icon: <Clock className="w-6 h-6" />,
                color: "bg-amber-50 border-amber-100",
                tag: "Most Popular",
                tagColor: "bg-amber-500",
              },
              {
                batch: "Afternoon Batch",
                time: "1:00 PM – 4:00 PM",
                days: "Sunday – Friday",
                icon: <CalendarDays className="w-6 h-6" />,
                color: "bg-blue-50 border-blue-100",
                tag: null,
                tagColor: "",
              },
              {
                batch: "Weekend Batch",
                time: "7:00 AM – 1:00 PM",
                days: "Saturday & Sunday",
                icon: <Users className="w-6 h-6" />,
                color: "bg-green-50 border-green-100",
                tag: "For Working Professionals",
                tagColor: "bg-green-600",
              },
            ].map((b, i) => (
              <div key={i} className={`${b.color} border rounded-[2rem] p-8 relative`}>
                {b.tag && (
                  <span className={`absolute -top-3 left-6 ${b.tagColor} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>{b.tag}</span>
                )}
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand mb-6 shadow-sm">{b.icon}</div>
                <h3 className="text-xl font-bold text-black mb-2">{b.batch}</h3>
                <p className="text-2xl font-extrabold text-brand mb-1">{b.time}</p>
                <p className="text-sm text-gray-500">{b.days}</p>
              </div>
            ))}
          </div>

          {/* Pricing Table */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-5 bg-black text-white text-[11px] font-bold uppercase tracking-widest px-8 py-4">
              <div className="col-span-2">Course</div>
              <div>Duration</div>
              <div>Class Size</div>
              <div>Fee (NPR)</div>
            </div>
            {[
              { course: "IELTS Academic / General", duration: "6 Weeks", size: "Max 15 students", fee: "Rs. 18,000" },
              { course: "IELTS Crash Course (4-week)", duration: "4 Weeks", size: "Max 12 students", fee: "Rs. 13,000" },
              { course: "PTE Academic", duration: "4 Weeks", size: "Max 12 students", fee: "Rs. 15,000" },
              { course: "TOEFL iBT", duration: "6 Weeks", size: "Max 15 students", fee: "Rs. 16,000" },
              { course: "SAT (Math + Verbal)", duration: "8 Weeks", size: "Max 10 students", fee: "Rs. 22,000" },
              { course: "Mock Test Only (per test)", duration: "3 hours", size: "Open seating", fee: "Rs. 1,500" },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-5 px-8 py-5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 last:border-0`}>
                <div className="col-span-2 font-semibold text-black">{row.course}</div>
                <div className="text-gray-600">{row.duration}</div>
                <div className="text-gray-600">{row.size}</div>
                <div className="font-bold text-brand">{row.fee}</div>
              </div>
            ))}
            <div className="px-8 py-4 bg-gray-50 text-xs text-gray-400">
              * Fees include all course materials. Group discounts available for 3+ students from the same college. Contact us for corporate/bulk rates.
            </div>
          </div>
        </div>
      </section>

      {/* Mock Tests */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel>Mock Tests</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-6">Simulate the Real Exam</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our full-length mock tests are held every Saturday under exam conditions. Receive a detailed score report within 24 hours, plus a 30-minute feedback session with your trainer.
              </p>
              <div className="space-y-4">
                {[
                  "IELTS Academic & General full-length mocks",
                  "PTE Academic timed simulations",
                  "TOEFL iBT section-wise and full tests",
                  "Written score report + trainer feedback",
                  "Track your band score improvement over time",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-brand shrink-0" /> {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-4">
                <Link href="/contact" className="bg-brand text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-all">Book a Mock Test</Link>
                <Link href="/tools/ielts-band-calculator" className="border border-gray-200 text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-all">IELTS Band Calculator</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Mock Tests Conducted", value: "500+" },
                { label: "Average Band Improvement", value: "+1.5" },
                { label: "Students Scored 7.0+", value: "78%" },
                { label: "Batch Pass Rate", value: "96%" },
              ].map((stat, i) => (
                <div key={i} className="bg-off-white rounded-2xl p-6 text-center border border-gray-100">
                  <div className="text-3xl font-extrabold text-brand mb-2">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>Our Faculty</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Learn from Certified Trainers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sanjiv Thapa",
                title: "IELTS & PTE Lead Trainer",
                credentials: "Cambridge CELTA Certified · IELTS Band 8.5",
                experience: "8+ years coaching",
                speciality: "Writing & Speaking",
                score: "⭐⭐⭐⭐⭐",
              },
              {
                name: "Priya Shrestha",
                title: "IELTS Academic Trainer",
                credentials: "TESOL Certified · British Council Alumni",
                experience: "6+ years coaching",
                speciality: "Listening & Reading",
                score: "⭐⭐⭐⭐⭐",
              },
              {
                name: "Roshan Karki",
                title: "SAT & TOEFL Trainer",
                credentials: "M.Ed. English · TOEFL iBT 118/120",
                experience: "5+ years coaching",
                speciality: "Math & Verbal",
                score: "⭐⭐⭐⭐⭐",
              },
            ].map((trainer, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center text-2xl font-black mb-6">
                  {trainer.name.charAt(0)}
                </div>
                <div className="text-sm text-gray-400 mb-1">{trainer.score}</div>
                <h3 className="text-xl font-bold text-black mb-1">{trainer.name}</h3>
                <p className="text-brand text-sm font-semibold mb-3">{trainer.title}</p>
                <p className="text-xs text-gray-500 mb-1">{trainer.credentials}</p>
                <p className="text-xs text-gray-400 mb-4">{trainer.experience} · Speciality: {trainer.speciality}</p>
                <div className="pt-4 border-t border-gray-100">
                  <Star className="w-3 h-3 inline text-brand mr-1" />
                  <span className="text-[11px] text-gray-500">Rated by students</span>
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
            src="/logo.png"
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
                sizes="(max-width: 1024px) 100vw, 50vw"
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
