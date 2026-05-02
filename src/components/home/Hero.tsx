import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-brand pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden">
      <div className="container relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            ICEF Accredited · Est. 2015
          </div>
          <h1 className="text-[clamp(40px,5.5vw,74px)] font-extrabold leading-[1.03] mb-6 tracking-tight">
            Your Transit to<br />Global Destinations
          </h1>
          <p className="text-white/85 text-lg max-w-[480px] mb-10">
            Expert visa guidance for Canada, Australia, UK, USA & Europe. 4 branches across Nepal — Kathmandu, Itahari, Damak, Damauli.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-brand hover:bg-gray-100 font-bold text-base h-14 px-8" })}>
              Book Free Consultation
            </Link>
            <Link href="/study-abroad/canada" className={buttonVariants({ size: "lg", variant: "outline", className: "border-white text-white hover:bg-white/10 font-bold text-base h-14 px-8 bg-transparent" })}>
              Explore Destinations
            </Link>
          </div>
        </div>
        
        <div className="lg:col-span-4 flex flex-row lg:flex-col gap-4 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar scroll-snap-x snap-mandatory">
          <div className="snap-start bg-white/10 border border-white/20 p-6 rounded-2xl min-w-[200px] flex-1">
            <div className="text-4xl font-black text-white mb-1">500+</div>
            <div className="text-white/80 font-medium">Visas Granted</div>
          </div>
          <div className="snap-start bg-white/10 border border-white/20 p-6 rounded-2xl min-w-[200px] flex-1">
            <div className="text-4xl font-black text-white mb-1">10+</div>
            <div className="text-white/80 font-medium">Years Experience</div>
          </div>
          <div className="snap-start bg-white/10 border border-white/20 p-6 rounded-2xl min-w-[200px] flex-1">
            <div className="text-4xl font-black text-white mb-1">4</div>
            <div className="text-white/80 font-medium">Branches</div>
          </div>
        </div>
      </div>
    </section>
  );
}
