"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Loader2, Lock, Mail } from "lucide-react";

export default function CmsLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function startLockoutTimer(retryAfter: number) {
    setSecondsLeft(retryAfter)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setError("")
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = String(s % 60).padStart(2, '0')
    return `${m}:${sec}`
  }

  const locked = secondsLeft > 0

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/cms/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 429) {
        startLockoutTimer(data.retryAfter ?? 900)
        setError(`Account locked. Try again in ${formatTime(data.retryAfter ?? 900)}.`)
        setAttemptsLeft(null)
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        if (typeof data.attemptsLeft === 'number') {
          setAttemptsLeft(data.attemptsLeft)
          if (data.attemptsLeft === 0) startLockoutTimer(900)
        }
        return;
      }

      router.push('/cms');
    } catch {
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
              {locked
                ? `Too many failed attempts. Try again in ${formatTime(secondsLeft)}.`
                : error}
            </div>
          )}

          {!locked && attemptsLeft !== null && attemptsLeft > 0 && (
            <div className="bg-orange-50 border border-orange-100 text-orange-600 text-[12px] p-3 rounded-lg font-medium text-center">
              {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout.
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
                disabled={locked}
                className="w-full pl-10 pr-4 py-3 border border-[#E0DADA] rounded-[12px] text-[13px] outline-none focus:border-[#A93226] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={locked}
                className="w-full pl-10 pr-4 py-3 border border-[#E0DADA] rounded-[12px] text-[13px] outline-none focus:border-[#A93226] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || locked}
            className="w-full bg-[#A93226] text-white py-3.5 rounded-[12px] text-[14px] font-[700] hover:bg-[#7E2219] shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 className="animate-spin" size={18} />
              : locked
              ? `Locked · ${formatTime(secondsLeft)}`
              : "Sign In to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
