import SectionLabel from "@/components/shared/SectionLabel";
import { FileDown, Globe2, BookOpen, ClipboardList, Info, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function ResourcesPage() {
  const categories = [
    {
      title: "Visa Documents",
      icon: <ClipboardList className="w-8 h-8" />,
      resources: [
        { name: "NOC Application Guide", type: "PDF", size: "1.2 MB" },
        { name: "SOP Writing Checklist", type: "PDF", size: "850 KB" },
        { name: "Financial Affidavit Template", type: "DOCX", size: "45 KB" },
      ],
    },
    {
      title: "Official Links",
      icon: <Globe2 className="w-8 h-8" />,
      resources: [
        { name: "Canada IRCC Portal", type: "External", size: "Link" },
        { name: "Australia Home Affairs", type: "External", size: "Link" },
        { name: "UK VI Portal", type: "External", size: "Link" },
      ],
    },
    {
      title: "Test Prep Materials",
      icon: <BookOpen className="w-8 h-8" />,
      resources: [
        { name: "IELTS Vocabulary List", type: "PDF", size: "3.5 MB" },
        { name: "PTE Practice Test 1", type: "PDF", size: "2.1 MB" },
        { name: "TOEFL Structure Guide", type: "PDF", size: "1.1 MB" },
      ],
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/media-images/2021/04/lets-plan.png"
            alt="Student Resources"
            fill
            className="object-cover"
          />
        </div>
        <div className="container relative z-10 text-center">
          <SectionLabel className="text-white border-white/20 bg-white/10 mx-auto">Student Portal</SectionLabel>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8">
            Essential <span className="text-brand">Resources</span> for You
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to stay organized during your study abroad journey. From guides to official checklists.
          </p>
        </div>
      </section>

      {/* Resources List */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-black">{category.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {category.resources.map((res, rIdx) => (
                    <div key={rIdx} className="bg-off-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-brand/20 transition-all">
                      <div>
                        <h3 className="font-bold text-black text-sm group-hover:text-brand transition-colors">{res.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                          {res.type} &bull; {res.size}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-brand group-hover:text-white transition-all cursor-pointer">
                        <FileDown className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="bg-white rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-12 border border-gray-100 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Info className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-black mb-4">Can't Find What You're Looking For?</h2>
              <p className="text-gray-600 leading-relaxed">
                Our counsellors have access to hundreds of more specific documents, university-specific forms, and the latest visa guidelines.
              </p>
            </div>
            <div className="shrink-0">
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all shadow-lg"
              >
                Contact a Counsellor <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
