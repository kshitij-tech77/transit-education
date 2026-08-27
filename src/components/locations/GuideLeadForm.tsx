"use client";

import { useState } from "react";

interface Props {
  whatsapp: string;
  branchName: string;
}

export default function GuideLeadForm({ whatsapp, branchName }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/cms/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          notes: `Free guide request — ${branchName} inline form`,
          status: 'PENDING',
        }),
      });
    } catch (_) {}
    const msg = encodeURIComponent(
      `Hi Transit Education! I want the free 2025 Study Abroad Guide.\n\nName: ${name}\nPhone: ${phone}\nBranch: ${branchName}`
    );
    window.open(`https://wa.me/977${whatsapp}?text=${msg}`, '_blank');
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="bg-black p-12 rounded-2xl shadow-xl">
      {done ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">WhatsApp Opened!</h3>
          <p className="text-xs text-[#777]">Your details are saved. Our team will send the guide shortly.</p>
          <button
            onClick={() => { setDone(false); setName(""); setPhone(""); }}
            className="mt-6 text-[11px] text-brand hover:underline"
          >
            Submit another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} id="guide-form">
          <h3 className="text-xl font-bold text-white mb-1.5">Get Your Free Guide</h3>
          <p className="text-xs text-[#777] mb-7">Enter your details — sent to WhatsApp instantly.</p>
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold tracking-[0.13em] uppercase text-[#777] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] p-[13px_15px] rounded-[10px] text-[13px] text-white outline-none focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[0.13em] uppercase text-[#777] mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98X-XXXXXXX"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] p-[13px_15px] rounded-[10px] text-[13px] text-white outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-white text-xs font-bold tracking-[0.08em] uppercase py-[17px] rounded-[10px] hover:bg-brand-dark transition-colors mt-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Send Me the Free Guide →'}
            </button>
            <p className="text-[10px] text-[#444] text-center mt-2.5">
              We never share your number. WhatsApp only.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
