import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import siteSettings from "@/data/siteSettings.json";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const defaultTitle = siteSettings.siteName + " | " + siteSettings.tagline;
const defaultDescription = siteSettings.seo.defaultDescription;
const defaultOgImage = "/media/2021/05/Logo-png_website.png";

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: `%s | ${siteSettings.siteName}`
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://transiteducation.com.np",
    siteName: siteSettings.siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteSettings.siteName,
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  }
};

import Schema from "@/components/shared/Schema";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    name: siteSettings.siteName,
    url: "https://transiteducation.com.np",
    logo: "https://transiteducation.com.np" + defaultOgImage,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteSettings.phone,
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
