import Link from "next/link";
import Image from "next/image";
import { Home, Mail, Search, ArrowRight, BookOpen, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function NotFound() {
  const [{ data: settings }, { data: countries }, { data: branches }] = await Promise.allSettled([
    supabase.from("site_settings").select("*").single(),
    supabase.from("countries").select("name, code").eq("status", "LIVE"),
    supabase.from("branches").select("id, name"),
  ]).then(results => results.map(r => (r.status === "fulfilled" ? r.value : { data: null })));

  const studyAbroadLinks = countries?.map((c: any) => ({
    title: c.name,
    href: `/study-abroad/${c.code}`,
  })) ?? undefined;

  const locationsLinks = branches?.map((b: any) => ({
    title: b.name.replace(/ Branch$/i, "").replace(/ \(Head Office\)/i, "").trim(),
    href: `/locations/${b.name
      .replace(/ Branch$/i, "")
      .replace(/ \(Head Office\)/i, "")
      .trim()
      .toLowerCase()}`,
  })) ?? undefined;

  const QUICK_LINKS = [
    { label: "Study in Canada", href: "/study-abroad/canada", icon: MapPin },
    { label: "Study in Australia", href: "/study-abroad/australia", icon: MapPin },
    { label: "Study in UK", href: "/study-abroad/uk", icon: MapPin },
    { label: "Student Resources", href: "/resources", icon: BookOpen },
    { label: "Free Consultation", href: "/contact", icon: Mail },
  ];

  return (
    <>
      <Header
        studyAbroadLinks={studyAbroadLinks}
        locationsLinks={locationsLinks}
      />
      <main className="flex-1 flex flex-col pt-20">
        <section className="flex-1 flex items-center py-24 bg-[#FAFAF8]">
          <div className="container max-w-2xl mx-auto text-center">
            {/* Logo */}
            <Link href="/" className="inline-block mb-10">
              <Image
                src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Logo-png_website.png"
                alt="Transit Education"
                width={160}
                height={40}
                className="h-10 w-auto mx-auto"
              />
            </Link>

            {/* 404 */}
            <div className="inline-block bg-brand/10 rounded-2xl px-6 py-3 mb-8">
              <span className="text-7xl font-black text-brand leading-none">404</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
              Page not found
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved. Let us help you find what you need.
            </p>

            {/* Search hint */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 mb-10 shadow-sm">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="text-gray-400 text-sm">Try searching for a country, service, or topic...</span>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-semibold text-gray-700 hover:border-brand hover:text-brand hover:shadow-sm transition-all"
                >
                  <span className="flex items-center gap-2.5">
                    <link.icon className="w-4 h-4 text-brand" />
                    {link.label}
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>

            {/* Primary CTA */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand text-white font-bold px-8 py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-lg hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              Back to Homepage
            </Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
