import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BranchesStrip from "@/components/home/BranchesStrip";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import StickyCtaBar from "@/components/shared/StickyCtaBar";
import CookieConsent from "@/components/shared/CookieConsent";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ data: countries }, { data: branches }, { data: settings }] = await Promise.all([
    supabase.from('countries').select('name, code').eq('status', 'LIVE'),
    supabase.from('branches').select('id, name, address, phone'),
    supabase.from('site_settings').select('*').single()
  ]);

  const BRANCH_ORDER = ['kathmandu', 'itahari', 'damak', 'damauli'];

  const toSlug = (name: string) =>
    name.replace(/ Branch$/i, '').replace(/ \(Head Office\)/i, '').trim().toLowerCase();

  const sortedBranches = [...(branches || [])].sort((a, b) => {
    const ai = BRANCH_ORDER.indexOf(toSlug(a.name));
    const bi = BRANCH_ORDER.indexOf(toSlug(b.name));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const studyAbroadLinks = countries?.map(c => ({
    title: c.name,
    href: `/study-abroad/${c.code}`
  })) || [];

  const locationsLinks = sortedBranches.map(b => ({
    title: b.name.replace(/ Branch$/i, '').replace(/ \(Head Office\)/i, '').trim(),
    href: `/locations/${toSlug(b.name)}`
  }));

  const branchCards = sortedBranches.map(b => ({ ...b, slug: toSlug(b.name) }));

  return (
    <>
      <Header
        studyAbroadLinks={studyAbroadLinks.length > 0 ? studyAbroadLinks : undefined}
        locationsLinks={locationsLinks.length > 0 ? locationsLinks : undefined}
      />
      <main className="flex-1 flex flex-col overflow-x-hidden relative">{children}</main>
      <BranchesStrip branches={branchCards} />
      <Footer settings={settings} />
      <WhatsAppButton phoneNumber={settings?.whatsapp_number} />
      <StickyCtaBar phone={settings?.phone} whatsapp={settings?.whatsapp_number} />
      <CookieConsent />
      <Toaster />
    </>
  );
}
