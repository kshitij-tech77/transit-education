"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, MessageCircle, Send, Check } from "lucide-react";

const BRANCHES = [
  {
    slug: "kathmandu",
    label: "Kathmandu",
    sub: "Head Office",
    address: "Level 2, Purple House, Bagbazar, Kathmandu-4",
    phone: "01-5906277",
    whatsapp: "9703722229",
    hours: "Sun – Fri • 9:00 AM – 6:00 PM",
  },
  {
    slug: "itahari",
    label: "Itahari",
    sub: "Sunsari",
    address: "Rano Complex, Sangit Chowk, Itahari, Sunsari",
    phone: "025-590570",
    whatsapp: "9851160433",
    hours: "Sun – Fri • 9:00 AM – 6:00 PM",
  },
  {
    slug: "damak",
    label: "Damak",
    sub: "Jhapa",
    address: "Dipini Marg, Near Sagarmatha Petrol Pump, Damak, Jhapa",
    phone: "023-577162",
    whatsapp: "9804324556",
    hours: "Sun – Fri • 9:00 AM – 5:00 PM",
  },
  {
    slug: "damauli",
    label: "Damauli",
    sub: "Tanahun",
    address: "Main Road, Damauli, Tanahun, Nepal",
    phone: "065-590110",
    whatsapp: "9863685864",
    hours: "Sun – Fri • 10:00 AM – 5:00 PM",
  },
];

export default function ContactPageClient() {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [form, setForm] = useState({ name: "", phone: "", subject: "General Inquiry", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    try {
      await fetch("/api/cms/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          notes: `[${selectedBranch.label}] ${form.subject}: ${form.message}`,
          status: "PENDING",
          branch: selectedBranch.label,
        }),
      });
    } catch (_) {}
    const msg = encodeURIComponent(
      `Hi Transit Education ${selectedBranch.label}!\n\nName: ${form.name}\nPhone: ${form.phone}\nSubject: ${form.subject}\n${form.message ? `\n${form.message}` : ""}`
    );
    window.open(`https://wa.me/977${selectedBranch.whatsapp}?text=${msg}`, "_blank");
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-16">
      {/* ─── LEFT: Branch Tabs + Info ─── */}
      <div className="lg:col-span-5 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-black mb-6">Our Branches</h2>
          {/* Tab selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {BRANCHES.map((b) => (
              <button
                key={b.slug}
                onClick={() => setSelectedBranch(b)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  selectedBranch.slug === b.slug
                    ? "border-brand bg-brand text-white"
                    : "border-gray-100 bg-white hover:border-brand/30 text-black"
                }`}
              >
                <div className="font-bold text-[15px]">{b.label}</div>
                <div className={`text-[11px] mt-0.5 ${selectedBranch.slug === b.slug ? "text-white/70" : "text-gray-400"}`}>{b.sub}</div>
              </button>
            ))}
          </div>

          {/* Selected branch detail */}
          <div className="space-y-5">
            <div className="flex gap-5">
              <div className="w-11 h-11 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-black mb-1">{selectedBranch.label} Office</div>
                <div className="text-gray-600 text-sm">{selectedBranch.address}</div>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-11 h-11 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-black mb-1">Call Us</div>
                <a href={`tel:${selectedBranch.phone}`} className="text-gray-600 text-sm hover:text-brand">{selectedBranch.phone}</a>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-11 h-11 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-black mb-1">Hours</div>
                <div className="text-gray-600 text-sm">{selectedBranch.hours}</div>
                <div className="text-gray-400 text-xs mt-0.5">Saturday: Closed</div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-brand p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Chat with {selectedBranch.label}</h3>
            <p className="text-white/80 text-sm mb-6">Instant answers via WhatsApp — no wait, no appointment needed.</p>
            <a
              href={`https://wa.me/977${selectedBranch.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-brand px-8 py-4 rounded-full font-bold hover:bg-black hover:text-white transition-all shadow-lg"
            >
              <MessageCircle className="w-5 h-5" /> Start Chat →
            </a>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        </div>
      </div>

      {/* ─── RIGHT: Form ─── */}
      <div className="lg:col-span-7">
        <div className="bg-off-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-sm">
          {done ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Message Sent!</h3>
              <p className="text-gray-500 mb-2">Your details are saved. WhatsApp opened for <strong>{selectedBranch.label}</strong>.</p>
              <p className="text-gray-400 text-sm">Our team will respond shortly.</p>
              <button
                onClick={() => { setDone(false); setForm({ name: "", phone: "", subject: "General Inquiry", message: "" }); }}
                className="mt-8 text-brand font-semibold hover:underline text-sm"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-black mb-2">Send a Message</h2>
              <p className="text-gray-400 text-sm mb-8">
                Contacting: <span className="font-semibold text-brand">{selectedBranch.label} Branch</span>
                <button onClick={() => {}} className="ml-2 text-xs text-gray-400 hover:text-brand">change branch ↑</button>
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="ct-name" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Full Name *</label>
                    <input
                      id="ct-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="ct-phone" className="text-sm font-bold text-gray-700 uppercase tracking-wider">WhatsApp Number *</label>
                    <input
                      id="ct-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+977-98XXXXXXXX"
                      className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="ct-subject" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Subject</label>
                  <select
                    id="ct-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all appearance-none"
                  >
                    <option>General Inquiry</option>
                    <option>Free Consultation</option>
                    <option>Visa Consulting</option>
                    <option>Admission Support</option>
                    <option>Scholarships</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="ct-message" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Message</label>
                  <textarea
                    id="ct-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand text-white py-5 rounded-2xl text-base font-bold flex items-center justify-center gap-3 hover:bg-brand/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? "Sending..." : `Send to ${selectedBranch.label} →`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
