"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Send, Globe, Award, Users, BarChart3 } from "lucide-react";
import SectionLabel from "@/components/shared/SectionLabel";

const BENEFITS = [
  {
    icon: Award,
    title: "Established Brand",
    desc: "Leverage 11+ years of brand recognition, trust, and reputation Transit Education has built across Nepal.",
  },
  {
    icon: Globe,
    title: "Global Network",
    desc: "Access our network of 100+ partner universities across USA, UK, Canada, Australia, and more.",
  },
  {
    icon: Users,
    title: "Full Training & Support",
    desc: "Comprehensive onboarding, counsellor training, visa guidance materials, and ongoing operational support.",
  },
  {
    icon: BarChart3,
    title: "Proven Business Model",
    desc: "Start with a tested system — CRM, processes, marketing templates, and student management tools ready to use.",
  },
];

export default function FranchiseClient() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    business_background: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.full_name || !form.email || !form.phone || !form.city) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cms/franchise-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      {/* Hero */}
      <section className="bg-black text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--brand)_0%,_transparent_60%)] opacity-30" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <SectionLabel>Partnership Programme</SectionLabel>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-6">
              Become a Transit Education Partner
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Join Nepal's most trusted study-abroad consultancy network. Open your own Transit Education franchise and help students in your region access world-class education opportunities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <SectionLabel>Why Partner With Us</SectionLabel>
            <h2 className="text-3xl font-extrabold text-black mt-3">What You Get as a Partner</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-off-white p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white mb-5">
                  <b.icon size={24} />
                </div>
                <h3 className="font-bold text-lg text-black mb-3">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-off-white">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-3xl font-extrabold text-black mt-3">Getting Started is Simple</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: "01", title: "Submit Inquiry", desc: "Fill out the form below with your background and location." },
              { step: "02", title: "Initial Call", desc: "Our partnership team will reach out within 3–5 business days for a discovery call." },
              { step: "03", title: "Review & Agreement", desc: "We share the franchise model, terms, and investment details. Review and sign." },
              { step: "04", title: "Training & Launch", desc: "Complete our onboarding training and launch your Transit Education franchise." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 bg-white p-6 rounded-2xl border border-gray-100"
              >
                <span className="text-2xl font-black text-brand/20 shrink-0">{item.step}</span>
                <div>
                  <h3 className="font-bold text-black mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-24 bg-white">
        <div className="container max-w-2xl">
          <div className="text-center mb-12">
            <SectionLabel>Apply Now</SectionLabel>
            <h2 className="text-3xl font-extrabold text-black mt-3">Franchise Inquiry Form</h2>
            <p className="text-gray-500 mt-3">Fill in your details and our team will be in touch within 3–5 business days.</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-off-white rounded-3xl p-12 text-center border border-gray-100"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-black mb-3">Inquiry Received!</h3>
              <p className="text-gray-500">Thank you for your interest in becoming a Transit Education partner. Our team will contact you within 3–5 business days.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-off-white rounded-3xl p-8 md:p-12 border border-gray-100 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fr-name" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name *</label>
                  <input
                    id="fr-name"
                    type="text"
                    required
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand bg-white transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="fr-email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email *</label>
                  <input
                    id="fr-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand bg-white transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fr-phone" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone *</label>
                  <input
                    id="fr-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand bg-white transition-colors"
                    placeholder="+977 98XXXXXXXX"
                  />
                </div>
                <div>
                  <label htmlFor="fr-city" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">City / Location *</label>
                  <input
                    id="fr-city"
                    type="text"
                    required
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand bg-white transition-colors"
                    placeholder="e.g. Pokhara, Biratnagar"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fr-background" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Business Background</label>
                <textarea
                  id="fr-background"
                  rows={3}
                  value={form.business_background}
                  onChange={e => setForm(f => ({ ...f, business_background: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand bg-white transition-colors resize-none"
                  placeholder="Tell us about your current business or professional background..."
                />
              </div>

              <div>
                <label htmlFor="fr-message" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Message</label>
                <textarea
                  id="fr-message"
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand bg-white transition-colors resize-none"
                  placeholder="Any questions or additional information..."
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                <Send size={18} />
                {submitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
