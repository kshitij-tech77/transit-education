import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BranchesStrip from "@/components/home/BranchesStrip";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import StickyCtaBar from "@/components/shared/StickyCtaBar";
import CookieConsent from "@/components/shared/CookieConsent";
import MotionProvider from "@/components/shared/MotionProvider";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";
import { toBranchSlug } from "@/lib/branch-slug";

// These three queries feed shared chrome (nav links, footer branches, site
// settings) that changes rarely. Cached independently of each page's own
// `dynamic = 'force-dynamic'` so they don't hit Supabase on every request.
const getCachedCountries = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('countries')
      .select('name, id')
      .eq('status', 'LIVE');
    return data;
  },
  ['frontend-layout-countries'],
  { revalidate: 300, tags: ['countries'] }
);

const getCachedBranches = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('branches')
      .select('id, name, address, phone');
    return data;
  },
  ['frontend-layout-branches'],
  { revalidate: 300, tags: ['branches'] }
);

const getCachedSiteSettings = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    return data;
  },
  ['frontend-layout-site-settings'],
  { revalidate: 300, tags: ['site-settings'] }
);

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [countries, branches, settings] = await Promise.all([
    getCachedCountries(),
    getCachedBranches(),
    getCachedSiteSettings(),
  ]);

  const BRANCH_ORDER = ['kathmandu', 'itahari', 'damak', 'damauli'];

  const sortedBranches = [...(branches || [])].sort((a, b) => {
    const ai = BRANCH_ORDER.indexOf(toBranchSlug(a.name));
    const bi = BRANCH_ORDER.indexOf(toBranchSlug(b.name));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const studyAbroadLinks = countries?.map(c => ({
    title: c.name,
    href: `/study-abroad/${c.id}`
  })) || [];

  const locationsLinks = sortedBranches.map(b => ({
    title: b.name.replace(/ Branch$/i, '').replace(/ \(Head Office\)/i, '').trim(),
    href: `/locations/${toBranchSlug(b.name)}`
  }));

  const branchCards = sortedBranches.map(b => ({ ...b, slug: toBranchSlug(b.name) }));

  return (
    <MotionProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-lg focus:font-bold focus:text-sm focus:shadow-lg"
      >
        Skip to content
      </a>
      <Header
        studyAbroadLinks={studyAbroadLinks.length > 0 ? studyAbroadLinks : undefined}
        locationsLinks={locationsLinks.length > 0 ? locationsLinks : undefined}
      />
      <main id="main-content" className="flex-1 flex flex-col overflow-x-hidden relative">{children}</main>
      <BranchesStrip branches={branchCards} />
      <Footer settings={settings} />
      <WhatsAppButton phoneNumber={settings?.whatsapp_number} />
      <StickyCtaBar phone={settings?.phone} whatsapp={settings?.whatsapp_number} />
      <CookieConsent />
      <Toaster />
    </MotionProvider>
  );
}
