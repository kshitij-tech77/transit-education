import Hero from "@/components/home/Hero";
import UniversityLogos from "@/components/home/UniversityLogos";
import Destinations from "@/components/home/Destinations";
import WelcomeAbout from "@/components/home/WelcomeAbout";
import Services from "@/components/home/Services";
import WhyTransit from "@/components/home/WhyTransit";
import StatsSection from "@/components/home/StatsSection";
import ProcessSteps from "@/components/shared/ProcessSteps";
import SuccessStories from "@/components/home/SuccessStories";
import TeamTeaser from "@/components/home/TeamTeaser";
import Testimonials from "@/components/home/Testimonials";
import LatestBlog from "@/components/home/LatestBlog";
import ContactCTA from "@/components/home/ContactCTA";
import SectionLabel from "@/components/shared/SectionLabel";
import FAQAccordion from "@/components/shared/FAQAccordion";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Transit Education | Your Transit to Global Destinations",
  description: "Nepal's most trusted study abroad consultancy. Expert visa guidance for Canada, Australia, UK, USA & Europe.",
  alternates: { canonical: "https://transiteducation.com.np" },
  openGraph: {
    title: "Transit Education | Your Transit to Global Destinations",
    description: "Nepal's most trusted study abroad consultancy. Expert visa guidance for Canada, Australia, UK, USA & Europe.",
    url: "https://transiteducation.com.np",
    type: "website",
    images: [
      {
        url: "https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2025/02/Nepals-leading-study-abroad-consultants.png",
        width: 1200,
        height: 630,
        alt: "Transit Education — Nepal's Most Trusted Study Abroad Consultancy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Transit Education | Your Transit to Global Destinations",
    description: "Nepal's most trusted study abroad consultancy. Expert visa guidance for Canada, Australia, UK, USA & Europe.",
    images: ["https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2025/02/Nepals-leading-study-abroad-consultants.png"],
  },
};

export default async function Home() {
  const [faqsRes, teamRes, postsRes, testimonialsRes, successStoriesRes, settingsRes, countriesRes] = await Promise.all([
    supabase
      .from('faqs')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .limit(6),
    supabase
      .from('team_members')
      .select(`
        *,
        branches (name)
      `)
      .order('name', { ascending: true })
      .limit(4),
    supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .limit(3),
    supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('success_stories')
      .select('*')
      .order('year', { ascending: false })
      .limit(8),
    supabase
      .from('site_settings')
      .select('*')
      .single(),
    supabase
      .from('countries')
      .select('id, code, flag, name, status')
      .eq('status', 'LIVE')
      .order('name', { ascending: true }),
  ]);

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return countryCode;
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const featuredFaqs = faqsRes.data?.map(f => ({
    ...f,
    featured: f.is_featured,
    status: 'Published'
  })) || [];

  const teamMembers = teamRes.data?.map(m => ({
    ...m,
    role: m.role,
    photo: m.photo_url,
    branch: (m as any).branches?.name || 'N/A'
  })) || [];

  const blogPosts = postsRes.data?.map(p => ({
    ...p,
    publishDate: p.publish_date,
    featuredImage: p.featured_image
  })) || [];

  const testimonials = testimonialsRes.data?.map(t => {
    const flagCode = (t.country_id || '').trim();
    return {
      ...t,
      name: t.student_name,
      photo: t.photo_url,
      country: flagCode.length === 2 ? getFlagEmoji(flagCode) : flagCode
    };
  }) || [];

  const successStories = successStoriesRes.data?.map(s => {
    const flagCode = (s.country_id || '').trim();
    return {
      ...s,
      name: s.student_name,
      flag: flagCode.length === 2 ? getFlagEmoji(flagCode) : flagCode,
      approvalImage: s.approval_image_url
    };
  }) || [];

  const heroCountries = (countriesRes.data || []).map(c => {
    const flagCode = (c.flag || c.code || '').trim();
    return {
      ...c,
      flag: flagCode.length === 2 ? getFlagEmoji(flagCode) : flagCode,
    };
  });

  // FAQ Schema for Homepage
  const faqSchema = featuredFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": featuredFaqs.map((f: any) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Hero
        initialSuccessStories={successStories.slice(0, 6)}
        initialCountries={heroCountries}
        initialSettings={settingsRes.data}
      />
      <UniversityLogos />
      <Destinations />
      <WelcomeAbout />
      <Services />
      <StatsSection stats={settingsRes.data} />
      <WhyTransit />
      <ProcessSteps />
      <SuccessStories stories={successStories} />
      <TeamTeaser members={teamMembers} />
      <Testimonials testimonials={testimonials} />
      
      {/* FAQ Section */}
      <section className="py-24 bg-[#F7F3F3]">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <SectionLabel>Got Questions?</SectionLabel>
              <h2 className="text-4xl font-bold text-black mt-4">Expert Advice & FAQ</h2>
              <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                Everything you need to know about studying abroad, visa processes, and life in global destinations.
              </p>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
              <FAQAccordion items={featuredFaqs} />
            </div>
          </div>
        </div>
      </section>

      <LatestBlog posts={blogPosts} />
      <ContactCTA />
    </>
  );
}
