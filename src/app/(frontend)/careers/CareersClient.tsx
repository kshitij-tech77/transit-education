"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Upload, Send, CheckCircle, Users, TrendingUp, Heart } from "lucide-react";
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import SectionLabel from "@/components/shared/SectionLabel";

const anonClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WHY_JOIN = [
  { icon: TrendingUp, title: "Grow With Us", desc: "Transit Education has been helping students since 2015. Join a team with proven track record and ambitious growth plans." },
  { icon: Users, title: "Collaborative Culture", desc: "Work alongside passionate counsellors, visa experts, and education specialists who genuinely care about student outcomes." },
  { icon: Heart, title: "Meaningful Work", desc: "Every day you help change the trajectory of a student's life. Few careers offer this level of direct, lasting impact." },
];

export default function CareersClient() {
  const [openings, setOpenings] = useState<any[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    cover_letter: "",
  });

  if (openings === null) {
    fetch("/api/cms/job-openings")
      .then(r => r.json())
      .then(d => setOpenings(Array.isArray(d) ? d : []))
      .catch(() => setOpenings([]));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("CV file must be under 5MB"); return; }
    if (f.type !== "application/pdf") { setError("Only PDF files accepted"); return; }
    setError(null);
    setCvFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.full_name || !form.email || !form.phone || !form.position) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    let cv_url: string | undefined;

    try {
      if (cvFile) {
        setUploading(true);
        const ext = cvFile.name.split(".").pop();
        const filename = `cv_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadErr } = await anonClient.storage
          .from("career-uploads")
          .upload(filename, cvFile, { contentType: cvFile.type });

        if (uploadErr) throw new Error("CV upload failed: " + uploadErr.message);
        cv_url = uploadData.path;
        setUploading(false);
      }

      const res = await fetch("/api/cms/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cv_url }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setUploading(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      {/* Hero */}
      <section className="bg-black text-white pt-32 pb-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <SectionLabel>We're Hiring</SectionLabel>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-6">Join Our Team</h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Help students find their path to global education. At Transit Education, we're always looking for passionate people who want to make a difference.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20 bg-[#F7F3F3]">
        <div className="container">
          <div className="text-center mb-14">
            <SectionLabel>Why Transit?</SectionLabel>
            <h2 className="text-3xl font-extrabold text-black mt-3">More Than Just a Job</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {WHY_JOIN.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-[#A93226]/10 rounded-xl flex items-center justify-center text-[#A93226] mb-5">
                  <item.icon size={24} />
                </div>
                <h3 className="font-bold text-lg text-black mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <SectionLabel>Open Roles</SectionLabel>
            <h2 className="text-3xl font-extrabold text-black mt-3">Current Openings</h2>
          </div>

          {openings === null ? (
            <div className="text-center text-gray-400 py-12">Loading positions...</div>
          ) : openings.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No current openings listed.</p>
              <p className="text-gray-400 text-sm mt-2">We'd still love to hear from you — apply below with your preferred role.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {openings.map((job, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4 hover:border-[#A93226] hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-black">{job.title}</h3>
                    {job.description && <p className="text-gray-500 text-sm mt-1">{job.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {job.department && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          <Briefcase size={12} /> {job.department}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        <MapPin size={12} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        <Clock size={12} /> {job.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setForm(f => ({ ...f, position: job.title }));
                      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="shrink-0 bg-[#A93226] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#7E2219] transition-colors"
                  >
                    Apply Now
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-20 bg-[#F7F3F3]">
        <div className="container max-w-2xl">
          <div className="text-center mb-12">
            <SectionLabel>Apply Now</SectionLabel>
            <h2 className="text-3xl font-extrabold text-black mt-3">Send Your Application</h2>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-black mb-3">Application Submitted!</h3>
              <p className="text-gray-500">Thank you for your interest in joining Transit Education. Our team will review your application and contact you within 5–7 business days.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="ca-name" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name *</label>
                  <input
                    id="ca-name"
                    type="text"
                    required
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A93226] transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="ca-email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email *</label>
                  <input
                    id="ca-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A93226] transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="ca-phone" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone *</label>
                  <input
                    id="ca-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A93226] transition-colors"
                    placeholder="+977 98XXXXXXXX"
                  />
                </div>
                <div>
                  <label htmlFor="ca-position" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Position Applying For *</label>
                  <input
                    id="ca-position"
                    type="text"
                    required
                    value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A93226] transition-colors"
                    placeholder="e.g. Education Counsellor"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ca-cover" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cover Letter</label>
                <textarea
                  id="ca-cover"
                  rows={4}
                  value={form.cover_letter}
                  onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A93226] transition-colors resize-none"
                  placeholder="Tell us why you'd be a great fit for Transit Education..."
                />
              </div>

              <div>
                <label htmlFor="ca-cv" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Upload CV / Resume (PDF, max 5MB)</label>
                <input
                  ref={fileRef}
                  id="ca-cv"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#A93226] hover:text-[#A93226] transition-colors"
                >
                  <Upload size={18} />
                  {cvFile ? cvFile.name : "Click to upload your CV (PDF only)"}
                </button>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#A93226] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#7E2219] transition-colors disabled:opacity-60"
              >
                <Send size={18} />
                {uploading ? "Uploading CV..." : submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
