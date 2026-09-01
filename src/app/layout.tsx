import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { supabase } from "@/lib/supabase";
import Script from "next/script";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  const siteName = settings?.site_name || "Transit Education";
  const tagline = settings?.tagline || "Global Education";
  const defaultTitle = `${siteName} | ${tagline}`;
  const defaultDescription = settings?.seo_description || "Expert study abroad consultancy in Nepal.";
  const defaultOgImage = "https://transiteducation.com.np/logo.png";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`
    },
    description: defaultDescription,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://transiteducation.com.np",
      siteName: siteName,
      title: defaultTitle,
      description: defaultDescription,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary",
      title: defaultTitle,
      description: defaultDescription,
      images: [defaultOgImage],
    },
    robots: { index: true, follow: true }
  };
}

import Schema from "@/components/shared/Schema";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  const siteName = settings?.site_name || "Transit Education";
  const defaultOgImage = "https://transiteducation.com.np/logo.png";

  // sameAs / address mirror the same site_settings fallbacks Footer.tsx uses
  // for its social links, and the Kathmandu HQ address already published on
  // /locations/kathmandu — real, existing data, not new claims.
  const sameAs = [
    settings?.facebook_url || "https://facebook.com/transiteducation",
    settings?.instagram_url || "https://instagram.com/transiteducation",
    settings?.linkedin_url || "https://linkedin.com/company/transiteducation",
    settings?.tiktok_url,
  ].filter(Boolean);

  const orgSchema = {
    name: siteName,
    url: "https://transiteducation.com.np",
    logo: defaultOgImage,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Level 2, Purple House, Bagbazar",
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.phone || "01-5906277",
      contactType: "customer service",
      areaServed: "NP",
    },
    sameAs,
  };

  return (
    <html
      lang="en"
      className={`${poppins.variable} font-sans antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Schema type="Organization" data={orgSchema} />
      </head>
      <body className="min-h-screen flex flex-col font-sans" suppressHydrationWarning>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M9MYFR0ZYD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M9MYFR0ZYD');
          `}
        </Script>
      </body>
    </html>
  );
}
