import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at Transit Education | Join Nepal's Top Study Abroad Consultancy",
  description: "Explore job openings at Transit Education Nepal. Join a team of passionate counsellors, visa experts, and educators helping students reach global universities.",
  alternates: { canonical: "https://transiteducation.com.np/careers" },
  openGraph: {
    title: "Careers at Transit Education Nepal",
    description: "Work with Nepal's most trusted ICEF-accredited study abroad agency. Current openings in counselling, visa guidance, and education services.",
    url: "https://transiteducation.com.np/careers",
    type: "website",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
