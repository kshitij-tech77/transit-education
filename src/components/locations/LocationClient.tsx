"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Phone, MapPin, Clock, MessageSquare, ChevronRight, Check } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media-url";

interface LocationClientProps {
  location: any;
  slug: string;
}

export default function LocationClient({ location, slug }: LocationClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", country: "", ielts: "" });

  const slides = [
    location.heroImage,
    ...location.gallery
  ].map(resolveMediaUrl);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/cms/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          country: formData.country || '',
          notes: `Guide request from ${location.name} location page`,
          status: 'PENDING',
        }),
      });
    } catch (_) {}
    const msg = encodeURIComponent(
      `Hi Transit Education ${location.name}! I want the free 2025 Study Abroad Guide.\n\nName: ${formData.name}\nPhone: ${formData.phone}\nCountry: ${formData.country || 'Not selected'}\nBranch: ${location.name}`
    );
    window.open(`https://wa.me/977${location.whatsapp}?text=${msg}`, '_blank');
    setIsSubmitting(false);
    setIsPopupOpen(false);
  };

  return (
    <div className="font-sans antialiased text-[#111] bg-white overflow-x-hidden">
      {/* ─── HERO SLIDER ─── */}
      <section className="relative min-h-[92vh] bg-black overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-[1100ms] ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={slide}
                alt={`${location.name} Slide ${index + 1}`}
                fill
                sizes="100vw"
                className="object-cover brightness-[0.40] object-top"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        
        {/* Hero Overlay */}
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(105deg,rgba(8,8,8,0.88)_0%,rgba(8,8,8,0.55)_50%,rgba(8,8,8,0.12)_100%)]" />

        <div className="container relative z-[2] max-w-[1180px] mx-auto px-14 w-full">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/38 text-[#e8a09a] text-[10px] font-semibold tracking-[0.16em] uppercase px-4 py-2 rounded-full mb-7 animate-fade-in">
            <span className="w-[5px] h-[5px] rounded-full bg-[#e8a09a] animate-pulse" />
            {slug === 'kathmandu' ? 'Kathmandu • Bagbazar, Nepal' : slug === 'itahari' ? 'Itahari • Rano Complex, Sunsari' : `${location.name} • Nepal`}
          </div>
          
          <h1 className="text-[clamp(40px,5.5vw,74px)] font-extrabold leading-[1.03] text-white tracking-[-0.025em] mb-6 max-w-[680px] animate-slide-up">
            {slug === 'kathmandu' ? (
              <>Nepal's Central<br />Gateway to<br /><span className="text-brand">Global Education</span></>
            ) : slug === 'itahari' ? (
              <>Eastern Nepal's<br />Gateway to<br /><span className="text-brand">Global Education</span></>
            ) : (
              <>{location.name.split(' ')[0]}'s Gateway to<br /><span className="text-brand">Global Education</span></>
            )}
          </h1>
          
          <p className="text-base font-light text-white/60 leading-[1.8] max-w-[480px] mb-12 animate-slide-up [animation-delay:280ms]">
            From {location.address.split(',')[1]} to the world — we help students secure admissions and visas for Canada, Australia, the UK, Japan, and beyond.
          </p>

          <div className="flex gap-4 flex-wrap animate-slide-up [animation-delay:380ms]">
            <button 
              onClick={() => setIsPopupOpen(true)}
              className="bg-brand text-white text-[13px] font-semibold tracking-[0.04em] px-8 py-4 rounded-[10px] hover:bg-brand-dark hover:-translate-y-[2px] transition-all duration-200"
            >
              Download Free 2025 Guide
            </button>
            <a 
              href="#branch"
              className="inline-flex items-center gap-2 bg-transparent text-white text-[13px] font-medium px-7 py-4 border border-white/35 rounded-[10px] hover:border-white hover:bg-white/10 transition-all"
            >
              Visit Our Office →
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-14 right-14 flex gap-12 z-[2] animate-fade-in [animation-delay:500ms]">
          <div className="text-right">
            <div className="text-[38px] font-extrabold text-white leading-none tracking-[-0.03em]">2000<span className="text-brand">+</span></div>
            <div className="text-[9px] font-medium text-[#4a4a4a] tracking-[0.1em] uppercase mt-1">Students Sent Abroad</div>
          </div>
          <div className="text-right">
            <div className="text-[38px] font-extrabold text-white leading-none tracking-[-0.03em]">98<span className="text-brand">%</span></div>
            <div className="text-[9px] font-medium text-[#4a4a4a] tracking-[0.1em] uppercase mt-1">Visa Success Rate</div>
          </div>
          <div className="text-right">
            <div className="text-[38px] font-extrabold text-white leading-none tracking-[-0.03em]">15<span className="text-brand">+</span></div>
            <div className="text-[9px] font-medium text-[#4a4a4a] tracking-[0.1em] uppercase mt-1">Countries</div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-9 left-14 flex gap-2 z-[2]">
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-[3px] rounded-[2px] cursor-pointer transition-all duration-300 ${index === currentSlide ? 'w-[44px] bg-brand' : 'w-[24px] bg-white/20'}`}
            />
          ))}
        </div>
      </section>

      {/* ─── INFO BAR ─── */}
      <div className="bg-brand grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <a href={`tel:${location.phone}`} className="flex items-center gap-[14px] px-7 py-[22px] border-r border-white/15 hover:bg-brand-dark transition-colors group">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center transition-colors group-hover:bg-white/20">
            <Phone className="w-[17px] h-[17px] text-white" />
          </div>
          <div>
            <div className="text-[9px] font-semibold tracking-[0.12em] uppercase opacity-65 group-hover:opacity-100 text-white">Call Us</div>
            <div className="text-xs font-semibold text-white leading-[1.3]">{location.phone}</div>
          </div>
        </a>
        <a href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`} target="_blank" className="flex items-center gap-[14px] px-7 py-[22px] border-r border-white/15 hover:bg-brand-dark transition-colors group">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center transition-colors group-hover:bg-white/20">
            <MapPin className="w-[17px] h-[17px] text-white" />
          </div>
          <div>
            <div className="text-[9px] font-semibold tracking-[0.12em] uppercase opacity-65 group-hover:opacity-100 text-white">Location</div>
            <div className="text-xs font-semibold text-white leading-[1.3] truncate max-w-[200px]">{location.address.split(',')[0]}</div>
          </div>
        </a>
        <div className="flex items-center gap-[14px] px-7 py-[22px] border-r border-white/15 hover:bg-brand-dark transition-colors group cursor-default">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center transition-colors group-hover:bg-white/20">
            <Clock className="w-[17px] h-[17px] text-white" />
          </div>
          <div>
            <div className="text-[9px] font-semibold tracking-[0.12em] uppercase opacity-65 group-hover:opacity-100 text-white">Open Today</div>
            <div className="text-xs font-semibold text-white leading-[1.3]">{location.hours.split('•')[0]}</div>
          </div>
        </div>
        <a href={`https://wa.me/977${location.whatsapp}`} target="_blank" className="flex items-center gap-[14px] px-7 py-[22px] hover:bg-brand-dark transition-colors group">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center transition-colors group-hover:bg-white/20">
            <MessageSquare className="w-[17px] h-[17px] text-white" />
          </div>
          <div>
            <div className="text-[9px] font-semibold tracking-[0.12em] uppercase opacity-65 group-hover:opacity-100 text-white">WhatsApp</div>
            <div className="text-xs font-semibold text-white leading-[1.3]">Message Instantly</div>
          </div>
        </a>
      </div>

      {/* Popup Overlay */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 flex items-center justify-center p-5">
          <div className="bg-white max-w-[460px] w-full rounded-2xl overflow-hidden relative max-h-[92vh] overflow-y-auto animate-scale-in">
            <button 
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-[14px] right-[14px] w-[30px] h-[30px] bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/35 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-brand p-8 pt-8 pb-6 text-white">
              <h3 className="text-[22px] font-extrabold mb-1">Free 2025 Study Abroad Guide</h3>
              <p className="text-xs font-light opacity-75">For Nepali students. Sent to WhatsApp instantly, at no charge.</p>
            </div>
            <div className="p-8 pt-7 pb-8 space-y-4">
              <div>
                <label className="block text-[9px] font-bold tracking-[0.13em] uppercase text-[#6B6966] mb-[7px]">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Your name"
                  className="w-full bg-[#FAFAF8] border border-[#E5E4E0] px-[15px] py-[13px] rounded-[10px] text-[13px] outline-none focus:border-brand transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[0.13em] uppercase text-[#6B6966] mb-[7px]">WhatsApp Number</label>
                <input 
                  type="tel" 
                  placeholder="98X-XXXXXXX"
                  className="w-full bg-[#FAFAF8] border border-[#E5E4E0] px-[15px] py-[13px] rounded-[10px] text-[13px] outline-none focus:border-brand transition-colors"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[0.13em] uppercase text-[#6B6966] mb-[7px]">Where do you want to study?</label>
                <select 
                  className="w-full bg-[#FAFAF8] border border-[#E5E4E0] px-[15px] py-[13px] rounded-[10px] text-[13px] outline-none focus:border-brand transition-colors appearance-none"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                >
                  <option value="">Select a country</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>United Kingdom</option>
                  <option>Japan</option>
                  <option>South Korea</option>
                  <option>Germany</option>
                  <option>USA</option>
                  <option>Not sure yet</option>
                </select>
              </div>
              <button
                onClick={handleWhatsApp}
                disabled={isSubmitting}
                className="w-full bg-brand text-white text-xs font-bold tracking-[0.08em] uppercase py-[17px] rounded-[10px] hover:bg-brand-dark transition-colors mt-[6px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Get My Free Guide →'}
              </button>
              <p className="text-[10px] text-[#9A9895] text-center mt-[10px]">We never share your number. WhatsApp only.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
