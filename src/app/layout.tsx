import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Transit Education | Your Transit to Global Destinations",
  description: "Nepal's most trusted study abroad consultancy. Expert visa guidance for Canada, Australia, UK, USA & Europe. 4 branches across Nepal.",
};

import Schema from "@/components/shared/Schema";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    name: "Transit Education",
    url: "https://transiteducation.com.np",
    logo: "https://transiteducation.com.np/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+977-9851315991",
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
