import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";
import { buttonVariants } from "@/components/ui/button";

interface DestinationHeroProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export function DestinationHero({ title, subtitle, description, image }: DestinationHeroProps) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionLabel>{subtitle}</SectionLabel>
            <h1 className="text-4xl md:text-6xl font-extrabold text-black mt-6 mb-8 leading-tight">
              {title}
            </h1>
            <p className="text-gray-600 text-lg mb-10 leading-relaxed max-w-xl">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-brand text-white px-8" })}>
                Start Application <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2">
              <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-[240px] -rotate-3">
              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                "Nepal's #1 Choice for {subtitle} Admissions"
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand/5 -skew-x-12 translate-x-1/2" />
    </section>
  );
}

interface InfoSectionProps {
  title: string;
  content: string | string[];
}

export function InfoSection({ title, content }: InfoSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-4xl">
        <h2 className="text-3xl font-bold text-black mb-8">{title}</h2>
        {Array.isArray(content) ? (
          <div className="grid gap-4">
            {content.map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-off-white rounded-2xl border border-gray-100">
                <CheckCircle2 className="w-6 h-6 text-brand shrink-0" />
                <p className="text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose prose-lg max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    </section>
  );
}
