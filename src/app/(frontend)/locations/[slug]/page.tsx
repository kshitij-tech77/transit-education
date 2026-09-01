import SectionLabel from "@/components/shared/SectionLabel";
import { MapPin, Phone, Mail, Clock, ArrowRight, ExternalLink, MessageSquare, Check, Plus } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import LocationClient from "@/components/locations/LocationClient";
import GuideLeadForm from "@/components/locations/GuideLeadForm";
import LocationFAQ from "@/components/locations/LocationFAQ";
import { Metadata } from "next";

const locationsData = {
  "kathmandu": {
    name: "Kathmandu (Head Office)",
    address: "Level 2, Purple House, Bagbazar, Kathmandu-4",
    phone: "01-5906277",
    whatsapp: "9703722229",
    email: "info@transiteducation.com.np",
    hours: "Sunday – Friday • 9:00 AM – 6:00 PM",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5!2d85.3145!3d27.7041!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!3m3!1m2!1s0x39eb18fcb77fd4bd%3A0x58099b1a2b69a7e8!2sBagbazar%2C+Kathmandu!5e0!3m2!1sen!2snp!4v1000000000000",
    heroImage: "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-ktm-1.webp",
    gallery: [
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-ktm-2.png",
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-3-ktm.png"
    ],
    whyChooseUs: [
      { num: "01", title: "Free, Honest Counselling", text: "Walk into Level 2, Purple House, Bagbazar without an appointment. No consultation fee. Our advisors match you to the right country based on your profile." },
      { num: "02", title: "Everything Under One Roof", text: "SOP writing, university applications, bank guidance, IELTS referrals, and visa file preparation managed in-house at Bagbazar." },
      { num: "03", title: "15+ Countries, Every Intake", text: "Canada, Australia, UK, Japan, South Korea, Germany, USA, New Zealand, Ireland, and more. Active partnerships across 15+ destinations." },
      { num: "04", title: "Proven Results in Kathmandu", text: "2,000+ students processed from Kathmandu Valley. A 98% visa success rate. Real outcomes — not claims." }
    ],
    faqs: [
      { q: "What is the best study abroad consultancy in Kathmandu?", a: "Transit Education at Level 2, Purple House, Bagbazar is one of Kathmandu's most established study abroad consultancies. We are known for honest counselling, a 98% visa success rate, and zero hidden fees." },
      { q: "Which consultancy in Bagbazar helps with Canada student visa?", a: "Transit Education provides complete Canada student visa services — university shortlisting, Letter of Acceptance guidance, SOP writing, and full IRCC student permit filing." },
      { q: "Is counselling at Transit Education Kathmandu free?", a: "Yes — your first counselling session is completely free. Walk in to Level 2, Purple House, Bagbazar any day Sunday to Friday between 9 AM and 6 PM." }
    ],
    testimonials: [
      { name: "Aayush S.", text: "I visited three consultancies in Kathmandu before Transit Education. They were the only ones who gave me honest information about my chances instead of just taking my money. Canada student visa approved in 5 weeks.", meta: "Koteshwor, KTM • Seneca Polytechnic, Toronto" },
      { name: "Rachana K.", text: "My visa had been rejected once before i came to Transit Education. They rebuilt my application from scratch, rewrote my SOP, and fixed my bank documents. Second application approved.", meta: "Baneshwor, KTM • RMIT University, Melbourne" },
      { name: "Prashant M.", text: "I wanted a 1-year Master's to save time and money. Transit Education KTM found me a well-ranked university in Wales with a scholarship opportunity. Best decision I made.", meta: "Patan, KTM • Cardiff Metropolitan University, UK" }
    ]
  },
  "itahari": {
    name: "Itahari Branch",
    address: "Rano Complex, Sangit Chowk, Itahari, Sunsari",
    phone: "025-590570",
    whatsapp: "9851160433",
    email: "itahari@transiteducation.com.np",
    hours: "Sunday – Friday • 9:00 AM – 6:00 PM",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3573.2!2d87.2718!3d26.6651!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!3m3!1m2!1s0x39ef6c4b1d1d1d1d%3A0x1a1a1a1a1a1a1a1a!2sSangit+Chowk%2C+Itahari!5e0!3m2!1sen!2snp!4v1000000000001",
    heroImage: "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-ithari.png",
    gallery: [
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-consultancy-ithari-front-desk.png",
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-education-ithari-team.png",
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-consultancy-ithari-front-desk-2.png"
    ],
    whyChooseUs: [
      { num: "01", title: "Free, Honest Counselling", text: "Walk into Rano Complex, Sangit Chowk without an appointment. Our advisors match you to the right country based on your profile." },
      { num: "02", title: "Everything Under One Roof", text: "SOP writing, university applications, bank guidance, and visa file preparation managed in-house at Itahari." },
      { num: "03", title: "15+ Countries, Every Intake", text: "Canada, Australia, UK, Japan, South Korea, Germany, USA, and more. September, January, and May intakes covered." },
      { num: "04", title: "Proven Results in Eastern Nepal", text: "2,000+ students processed from Sunsari, Morang, and the Koshi region. A 98% visa success rate." }
    ],
    faqs: [
      { q: "What is the best study abroad consultancy in Itahari?", a: "Transit Education at Rano Complex, Sangit Chowk, Itahari is one of Eastern Nepal's most established study abroad consultancies." },
      { q: "Which consultancy in Sunsari helps with Canada student visa?", a: "Transit Education Itahari provides complete Canada student visa support including IRCC application filing and professional SOP writing." }
    ],
    testimonials: [
      { name: "Roshan S.", text: "I visited two consultancies in Itahari before Transit. They were the only ones who gave me honest information instead of just taking my money. Canada visa approved!", meta: "Itahari, Sunsari • Seneca Polytechnic, Toronto" },
      { name: "Priya K.", text: "My visa had been rejected once before. Transit Itahari rebuilt my application from scratch and fixed my bank documents. Second application approved.", meta: "Dharan, Sunsari • RMIT University, Melbourne" }
    ]
  },
  "damak": {
    name: "Damak Branch",
    address: "Dipini Marg, Near Sagarmatha Petrol Pump, Damak, Jhapa",
    phone: "023-577162",
    whatsapp: "9804324556",
    email: "damak@transiteducation.com.np",
    hours: "Sunday – Friday • 9:00 AM – 5:00 PM",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5!2d87.6975!3d26.6553!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!3m3!1m2!1s0x39eb18fcb77fd4bd%3A0x58099b1a2b69a7e8!2sDamak%2C+Jhapa!5e0!3m2!1sen!2snp!4v1000000000000",
    heroImage: "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-Consultancy-Damak-.png",
    gallery: [
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transite-consultancy-damak-frontedsk.png",
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-consultancy-damak-team.png",
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-consultancy-Damak-gate.png"
    ],
    whyChooseUs: [
      { num: "01", title: "Jhapa's Trusted Partner", text: "The most trusted study abroad consultancy in Damak. Expert guidance for students in Jhapa region." }
    ],
    faqs: [
      { q: "What is the best study abroad consultancy in Damak?", a: "Transit Education at Dipini Marg is Jhapa's leading study abroad consultancy." }
    ],
    testimonials: []
  },
  "damauli": {
    name: "Damauli Branch",
    address: "Main Road, Damauli, Tanahun, Nepal",
    phone: "065-590110",
    whatsapp: "9863685864",
    email: "damauli@transiteducation.com.np",
    hours: "Sunday – Friday • 10:00 AM – 5:00 PM",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.8!2d84.2721!3d27.9821!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!3m3!1m2!1s0x39ef4f1d1d1d1d1d%3A0x1a1a1a1a1a1a1a1a!2sDamauli%2C+Tanahun!5e0!3m2!1sen!2snp!4v1000000000002",
    heroImage: "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-Education-Damauli-.png",
    gallery: [
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-education-damauli-office.png",
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-education-damauli-class.png",
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-education-damauli-wwaiting.png",
      "https://res.cloudinary.com/xgpct4gs/image/upload/media/2026/04/Transit-education-damauli.png"
    ],
    whyChooseUs: [
      { num: "01", title: "Tanahun's Gateway", text: "Expert study abroad guidance for students in Damauli and surrounding Gandaki region." }
    ],
    faqs: [],
    testimonials: []
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = locationsData[slug as keyof typeof locationsData];
  if (!location) return {};
  const title = `Study Abroad Consultancy in ${location.name}`;
  const description = `Visit Transit Education at ${location.address}. Free counselling for student visas to Canada, Australia, UK, USA & more. ${location.phone}.`;
  return {
    title,
    description,
    alternates: { canonical: `https://transiteducation.com.np/locations/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://transiteducation.com.np/locations/${slug}`,
      type: "website",
      images: [{ url: location.heroImage, width: 1200, height: 630, alt: location.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [location.heroImage],
    },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = locationsData[slug as keyof typeof locationsData];

  if (!location) {
    notFound();
  }

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Transit Education — ${location.name}`,
    image: location.heroImage,
    url: `https://transiteducation.com.np/locations/${slug}`,
    telephone: location.phone,
    email: location.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressCountry: "NP",
    },
    openingHours: "Su-Fr 09:00-18:00",
    priceRange: "Free consultation",
    sameAs: ["https://transiteducation.com.np"],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://transiteducation.com.np" },
      { "@type": "ListItem", position: 2, name: "Locations", item: "https://transiteducation.com.np/locations" },
      { "@type": "ListItem", position: 3, name: location.name, item: `https://transiteducation.com.np/locations/${slug}` },
    ],
  };

  return (
    <main className="pt-20 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <LocationClient location={location} slug={slug} />

      {/* ─── BRANCH DETAIL ─── */}
      <section className="py-24 bg-off-white" id="branch">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-18 items-start">
            {/* Photo mosaic — asymmetric row heights are a deliberate layout choice
                without a clean single-utility equivalent, so kept as an arbitrary value. */}
            <div className="grid grid-cols-2 grid-rows-[280px_170px] gap-1.5 rounded-xl overflow-hidden">
              <div className="col-span-2 overflow-hidden">
                <Image src={location.heroImage} alt="Main office" width={600} height={400} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="overflow-hidden">
                <Image src={location.gallery[0]} alt="Office interior" width={300} height={200} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="overflow-hidden relative group">
                <Image src={location.gallery[1]} alt="Team" width={300} height={200} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/48 flex items-center justify-center text-white text-xs font-semibold tracking-widest uppercase cursor-pointer opacity-100 group-hover:bg-brand/65 transition-colors">View All Photos</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-0.5 bg-brand rounded-full" />
                <span className="text-xs font-bold tracking-widest uppercase text-brand">{slug} Branch</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-[1.12] text-black mb-1.5 tracking-tight">{location.address.split(',')[0]},<br />{location.address.split(',')[1]}</h2>
              <p className="text-xs font-medium text-brand tracking-wider uppercase mb-6">Nepal's Study Abroad Office</p>

              <div className="inline-flex items-center gap-1.75 bg-green-50 text-green-700 text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-green-700 animate-pulse" />
                Open Now
              </div>

              <div className="flex flex-col gap-4 mb-7 pb-7 border-b border-gray-200">
                <div className="flex items-start gap-3.5 p-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center group-hover:bg-brand transition-colors">
                    <MapPin className="w-4 h-4 text-brand group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.75">Address</div>
                    <div className="text-sm font-medium text-black leading-[1.6]">{location.address}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center group-hover:bg-brand transition-colors">
                    <Phone className="w-4 h-4 text-brand group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.75">Phone</div>
                    <div className="text-sm font-medium text-brand">{location.phone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center group-hover:bg-brand transition-colors">
                    <MessageSquare className="w-4 h-4 text-brand group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.75">WhatsApp</div>
                    <div className="text-sm font-medium text-brand"><a href={`https://wa.me/977${location.whatsapp}`} target="_blank">+977 {location.whatsapp}</a></div>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center group-hover:bg-brand transition-colors">
                    <Mail className="w-4 h-4 text-brand group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.75">Email</div>
                    <div className="text-sm font-medium text-brand"><a href={`mailto:${location.email}`}>{location.email}</a></div>
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2.5">Office Hours</div>
              <div className="flex justify-between py-2.5 border-b border-gray-200 text-sm">
                <span className="text-gray-600 font-medium">Sunday – Friday</span>
                <span className="text-black font-semibold">{location.hours.split('•')[1]}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-gray-200 text-sm">
                <span className="text-gray-600 font-medium">Saturday</span>
                <span className="text-gray-400">Closed</span>
              </div>

              <div className="flex gap-3 mt-7 flex-wrap">
                <button className="bg-brand text-white text-sm font-semibold px-7.5 py-3.75 rounded-lg hover:bg-brand-dark hover:-translate-y-0.5 transition-all">Download Free Guide</button>
                <a href={`https://wa.me/977${location.whatsapp}`} target="_blank" className="bg-transparent text-black text-sm font-medium px-6.5 py-3.25 border border-gray-200 rounded-lg hover:border-brand hover:bg-brand hover:text-white transition-all">WhatsApp Us →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAP ─── */}
      <div className="relative h-105 bg-gray-100 overflow-hidden">
        <iframe src={location.mapUrl} className="w-full h-full border-none" loading="lazy" />
        {/* Custom shadow depth not covered by the standard shadow scale — kept arbitrary. */}
        <div className="absolute top-7 left-10 bg-white py-6 px-6.5 max-w-70 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.11)] z-10">
          <div className="text-base font-bold text-black mb-1.5">Transit Education {slug.charAt(0).toUpperCase() + slug.slice(1)}</div>
          <div className="text-xs text-gray-400 leading-[1.7] mb-4">{location.address}</div>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`} target="_blank" className="bg-brand text-white text-xs font-semibold px-5 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-brand-dark transition-colors">Get Directions →</a>
        </div>
      </div>

      {/* ─── WHY US ─── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="mb-14">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-0.5 bg-brand rounded-full" />
              <span className="text-xs font-bold tracking-widest uppercase text-brand">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-black">Why {slug.charAt(0).toUpperCase() + slug.slice(1)} Students<br />Trust <span className="text-brand">Transit Education</span></h2>
            <p className="text-sm text-gray-400 leading-[1.85] mt-3.5 max-w-130">No commission pressure. No hollow promises. Just straightforward guidance from counsellors who know the Nepali student visa process inside out.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Custom brand-tinted shadow not covered by the standard shadow scale — kept arbitrary. */}
            {location.whyChooseUs.map((item, idx) => (
              <div key={idx} className="bg-off-white py-11 px-10 rounded-xl border border-transparent hover:border-brand hover:bg-white hover:-translate-y-0.75 hover:shadow-[0_12px_40px_rgba(169,50,38,0.10)] transition-all duration-300 group">
                <div className="text-5xl font-extrabold text-gray-200 leading-none tracking-tighter mb-4 group-hover:text-brand-light transition-colors">{item.num}</div>
                <div className="w-11 h-11 bg-brand-light rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand transition-colors">
                  <Check className="w-5.5 h-5.5 text-brand group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-black mb-3 group-hover:text-brand transition-colors">{item.title}</h3>
                <p className="text-sm font-light text-gray-600 leading-[1.85]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section className="py-24 bg-black">
        <div className="container">
          <div className="mb-14">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-0.5 bg-brand rounded-full" />
              <span className="text-xs font-bold tracking-widest uppercase text-brand">Destinations</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-white">Where Will<br /><span className="text-brand">You Go?</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1 rounded-xl overflow-hidden">
            {[
              { name: "Canada", img: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&q=80", tag: "Most Popular • PR Pathway", span: "lg:col-span-2" },
              { name: "Australia", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80", tag: "Work While You Study" },
              { name: "United Kingdom", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80", tag: "1-Year Masters" },
              { name: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", tag: "Low Cost • High Quality" }
            ].map((dest, idx) => (
              <div key={idx} className={`relative h-95 group overflow-hidden cursor-pointer bg-black ${dest.span || ''}`}>
                <Image src={dest.img} alt={dest.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover opacity-38 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 group-hover:pb-7 transition-all">
                  <span className="text-base font-bold text-white block">{dest.name}</span>
                  {/* #e8a09a is a one-off decorative hover tint, not part of the brand token set. */}
                  <span className="text-xs font-semibold tracking-widest uppercase text-brand mt-1 block group-hover:text-[#e8a09a] transition-colors">{dest.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LEAD CAPTURE ─── */}
      <section id="guide-form" className="py-24 bg-white border-t border-gray-200">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-6 h-0.5 bg-brand rounded-full" />
                <span className="text-xs font-bold tracking-widest uppercase text-brand">Free Resource</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] text-black mb-4.5 tracking-tight">Get the Free<br /><em className="italic font-light text-brand not-italic">2025 Study Abroad Guide</em><br />for Nepali Students</h2>
              <p className="text-sm font-light text-gray-600 leading-[1.85] mb-9">Everything you need to know before applying — destination costs in NPR, IELTS requirements, intake calendars, and the most common visa mistakes to avoid.</p>

              <div className="space-y-3">
                {["Top 8 countries for Nepali students", "Full cost breakdown in NPR", "Minimum IELTS scores by destination", "2025 intake deadlines calendar"].map((perk, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors">
                    <div className="w-5 h-5 bg-brand-light rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-brand" />
                    </div>
                    {perk}
                  </div>
                ))}
              </div>
            </div>

            <GuideLeadForm whatsapp={location.whatsapp} branchName={location.name} />
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="mb-14">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-0.5 bg-brand rounded-full" />
              <span className="text-xs font-bold tracking-widest uppercase text-brand">Common Questions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-black">Everything You've<br />Been <span className="text-brand">Wondering</span></h2>
          </div>

          <LocationFAQ faqs={location.faqs} />
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="mb-14 text-center lg:text-left">
            <div className="flex items-center gap-2.5 mb-4 justify-center lg:justify-start">
              <div className="w-6 h-0.5 bg-brand rounded-full" />
              <span className="text-xs font-bold tracking-widest uppercase text-brand">Student Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-black">Real Students.<br /><span className="text-brand">Real Results.</span></h2>
          </div>

          {/* Custom brand-tinted shadow not covered by the standard shadow scale — kept arbitrary. */}
          <div className="grid lg:grid-cols-3 gap-5">
            {location.testimonials.map((testi, i) => (
              <div key={i} className="p-8 border border-gray-200 rounded-xl relative hover:border-brand hover:shadow-[0_8px_32px_rgba(169,50,38,0.10)] transition-all group">
                <span className="text-6xl text-brand leading-[0.55] mb-4.5 block font-serif">"</span>
                <div className="text-amber-500 text-xs tracking-widest mb-3.5">★★★★★</div>
                <p className="text-sm font-light text-gray-600 leading-[1.85] mb-6 group-hover:text-black transition-colors">{testi.text}</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-xs font-bold text-brand group-hover:bg-brand group-hover:text-white transition-colors">{testi.name.split(' ')[0][0]}</div>
                  <div>
                    <div className="text-sm font-bold text-black">{testi.name}</div>
                    <div className="text-xs font-light text-gray-400">{testi.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section className="py-24 bg-black text-center">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3.5 tracking-tight">Start Your Journey<br />from <span className="text-brand">{slug.charAt(0).toUpperCase() + slug.slice(1)} Today</span></h2>
          <p className="text-sm font-light text-gray-400 mb-10 max-w-lg mx-auto">Walk in, call {location.phone}, or WhatsApp {location.whatsapp}. Free counselling. No appointment needed.</p>
          <div className="flex justify-center gap-3.5 flex-wrap">
            <a href="#guide-form" className="bg-brand text-white text-sm font-semibold px-8 py-4 rounded-lg hover:bg-brand-dark transition-all">Download Free 2025 Guide</a>
            <a href={`https://wa.me/977${location.whatsapp}`} target="_blank" className="bg-transparent text-white text-sm font-medium px-7 py-4 border border-white/35 rounded-lg hover:border-white hover:bg-white/10 transition-all">WhatsApp Us →</a>
          </div>
        </div>
      </section>
    </main>
  );
}
