"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

/* Fix #16 — client-side email validation + visible inline success message */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to subscribe");

      setSuccess(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-6">
        <p className="text-xs text-white font-bold uppercase tracking-widest mb-3">Newsletter</p>
        <div className="flex items-center gap-2.5 bg-green-900/40 border border-green-700/50 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-green-300 text-sm font-semibold">You're subscribed — we'll keep you posted!</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6" noValidate>
      <p className="text-xs text-white font-bold uppercase tracking-widest mb-3">Newsletter</p>
      <div className="relative">
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:border-brand transition-colors"
          required
          aria-label="Email address for newsletter"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Subscribe to newsletter"
          className="absolute right-1 top-1 bottom-1 px-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </form>
  );
}
