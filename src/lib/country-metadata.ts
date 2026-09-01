import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

interface CountryMetadataFallback {
  title: string;
  description: string;
  /** Falls back to `title`/`description` when omitted. */
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * Metadata for the 8 statically-routed country pages (study-abroad/usa,
 * /canada, etc. — see CountryDestinationPage.tsx). Those pages used to export
 * a hardcoded `metadata` object that never reflected the CMS's Meta
 * Title/Description fields and never noindexed a Draft page, even though
 * CountryDestinationPage itself now 404s for a Draft country. Mirrors the
 * working logic already in study-abroad/[slug]/page.tsx's generateMetadata,
 * so an editor's CMS SEO edits and Draft/Live toggle actually take effect
 * here too, with `fallback` used only when the country isn't live yet or its
 * CMS fields are still empty.
 */
export async function getCountryMetadata(id: string, fallback: CountryMetadataFallback): Promise<Metadata> {
  const { data: country } = await supabase
    .from("countries")
    .select("status, meta_title, meta_description")
    .eq("id", id)
    .single();

  const isLive = country?.status === "LIVE";
  const title = (isLive && country?.meta_title) || fallback.title;
  const description = (isLive && country?.meta_description) || fallback.description;
  const url = `https://transiteducation.com.np/study-abroad/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fallback.ogTitle ?? title,
      description: fallback.ogDescription ?? description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fallback.ogTitle ?? title,
      description: fallback.ogDescription ?? description,
    },
    // notFound() (thrown by CountryDestinationPage for a non-LIVE country)
    // already auto-injects a noindex tag, but generateMetadata resolves
    // independently of that, so this is explicit defense-in-depth rather
    // than relying solely on the page body's behavior.
    ...(isLive ? {} : { robots: { index: false, follow: false } }),
  };
}
