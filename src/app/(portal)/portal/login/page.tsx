"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Mail, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Step = "email" | "otp";

export default function PortalLogin() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferralCode(ref.toUpperCase());
  }, []);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const next = referralCode
        ? `/portal/dashboard?ref=${encodeURIComponent(referralCode)}`
        : "/portal/dashboard";
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (otpError) throw otpError;
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (verifyError) throw verifyError;

      await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: referralCode || undefined }),
      });

      router.push("/portal/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-white rounded-[24px] shadow-2xl border border-[#E5E4E0] overflow-hidden">
        <div className="p-10 pb-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-[60px] h-[60px] bg-brand rounded-[16px] flex items-center justify-center shadow-lg">
              <ArrowUpRight size={34} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-[22px] font-[800] text-[#111]">Transit Rewards</h1>
          <p className="text-brand text-[12px] font-[700] tracking-[0.08em] uppercase mt-1">Student Loyalty Portal</p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="p-10 pt-4 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] p-3 rounded-lg font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="portal-email" className="text-[10px] font-[700] text-[#999] uppercase tracking-[0.08em] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" size={16} />
                <input
                  id="portal-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E0DADA] rounded-[12px] text-[13px] outline-none focus:border-brand transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="portal-ref" className="text-[10px] font-[700] text-[#999] uppercase tracking-[0.08em] ml-1">Referral Code (optional)</label>
              <input
                id="portal-ref"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-[#E0DADA] rounded-[12px] text-[13px] outline-none focus:border-brand transition-all"
                placeholder="Friend's code"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3.5 rounded-[12px] text-[14px] font-[700] hover:bg-brand-dark shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Login Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="p-10 pt-4 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] p-3 rounded-lg font-medium text-center">
                {error}
              </div>
            )}

            <p className="text-[12px] text-gray-500 text-center">
              We sent a 6-digit code to <span className="font-semibold text-black">{email}</span>
            </p>

            <div className="space-y-1.5">
              <label htmlFor="portal-otp" className="text-[10px] font-[700] text-[#999] uppercase tracking-[0.08em] ml-1">Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" size={16} />
                <input
                  id="portal-otp"
                  inputMode="numeric"
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E0DADA] rounded-[12px] text-[13px] tracking-[0.3em] outline-none focus:border-brand transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3.5 rounded-[12px] text-[14px] font-[700] hover:bg-brand-dark shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(""); setError(""); }}
              className="w-full text-[12px] font-semibold text-gray-400 hover:text-brand transition-colors"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
