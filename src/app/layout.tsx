import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { supabase } from "@/lib/supabase";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  const siteName = settings?.site_name || "Transit Education";
  const tagline = settings?.tagline || "Global Education";
  const defaultTitle = `${siteName} | ${tagline}`;
  const defaultDescription = settings?.seo_description || "Expert study abroad consultancy in Nepal.";
  const defaultOgImage = "/media/2021/05/Logo-png_website.png";

  return {
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
      card: "summary_large_image",
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
  const defaultOgImage = "/media/2021/05/Logo-png_website.png";

  const orgSchema = {
    name: siteName,
    url: "https://transiteducation.com.np",
    logo: "https://transiteducation.com.np" + defaultOgImage,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.phone || "01-5906277",
      contactType: "customer service"
    }
  };

  return (
    <html
      lang="en"
      className={`${poppins.variable} font-sans antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <Schema type="Organization" data={orgSchema} />
      </head>
      <body className="min-h-screen flex flex-col font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
