"use client";

import React, { useState } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Loader2, Lock, Mail } from "lucide-react";

export default function CmsLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.push('/cms');
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3F3] flex items-center justify-center p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif !important; }
      `}</style>

      <div className="w-full max-w-[400px] bg-white rounded-[24px] shadow-2xl border border-[#EDE8E8] overflow-hidden">
        <div className="p-10 pb-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-[60px] h-[60px] bg-[#A93226] rounded-[16px] flex items-center justify-center shadow-lg">
              <ArrowUpRight size={34} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-[24px] font-[800] text-[#111] leading-tight uppercase">Transit Education</h1>
          <p className="text-[#A93226] text-[12px] font-[700] tracking-[0.1em] uppercase mt-1">CMS Portal Access</p>
        </div>

        <form onSubmit={handleLogin} className="p-10 pt-4 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] p-3 rounded-lg font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-[700] text-[#999] uppercase tracking-[0.08em] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0DADA] rounded-[12px] text-[13px] outline-none focus:border-[#A93226] transition-all"
                placeholder="admin@transiteducation.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-[700] text-[#999] uppercase tracking-[0.08em] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0DADA] rounded-[12px] text-[13px] outline-none focus:border-[#A93226] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A93226] text-white py-3.5 rounded-[12px] text-[14px] font-[700] hover:bg-[#7E2219] shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
