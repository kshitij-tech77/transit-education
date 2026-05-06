import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import CookieConsent from "@/components/shared/CookieConsent";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch dynamic navigation and site settings
  const [{ data: countries }, { data: branches }, { data: settings }] = await Promise.all([
    supabase.from('countries').select('name, code').eq('status', 'LIVE'),
    supabase.from('branches').select('name, location_slug'),
    supabase.from('site_settings').select('*').single()
  ]);

  const studyAbroadLinks = countries?.map(c => ({
    title: c.name,
    href: `/study-abroad/${c.code}`
  })) || [];

  const locationsLinks = branches?.map(b => ({
    title: b.name.replace(' Branch', '').replace(' (Head Office)', ''),
    href: `/locations/${b.location_slug}`
  })) || [];

  return (
    <>
      <Header 
        studyAbroadLinks={studyAbroadLinks.length > 0 ? studyAbroadLinks : undefined}
        locationsLinks={locationsLinks.length > 0 ? locationsLinks : undefined}
      />
      <main className="flex-1 flex flex-col overflow-x-hidden relative">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton phoneNumber={settings?.whatsapp_number} />
      <CookieConsent />
      <Toaster />
    </>
  );
}
