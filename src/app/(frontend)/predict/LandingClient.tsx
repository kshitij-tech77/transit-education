'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useContest } from '@/components/predict/ContestProvider';
import MatchCard from '@/components/predict/MatchCard';
import PrizeCard from '@/components/predict/PrizeCard';
import Leaderboard from '@/components/predict/Leaderboard';
import type { Match, Prize, LeaderboardEntry } from '@/types/contest';

// ── Background football field pattern ─────────────────────────────────────
function FieldPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Pitch outline */}
        <rect x="20" y="20" width="760" height="460" fill="none" stroke="white" strokeWidth="2" />
        {/* Centre circle */}
        <circle cx="400" cy="250" r="80" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="400" cy="250" r="3" fill="white" />
        {/* Centre line */}
        <line x1="400" y1="20" x2="400" y2="480" stroke="white" strokeWidth="2" />
        {/* Left penalty area */}
        <rect x="20" y="145" width="132" height="210" fill="none" stroke="white" strokeWidth="2" />
        <rect x="20" y="190" width="55" height="120" fill="none" stroke="white" strokeWidth="2" />
        {/* Right penalty area */}
        <rect x="648" y="145" width="132" height="210" fill="none" stroke="white" strokeWidth="2" />
        <rect x="725" y="190" width="55" height="120" fill="none" stroke="white" strokeWidth="2" />
        {/* Corner arcs */}
        <path d="M20 30 Q30 20 40 20" fill="none" stroke="white" strokeWidth="2" />
        <path d="M760 30 Q770 20 780 20" fill="none" stroke="white" strokeWidth="2" />
        <path d="M20 470 Q30 480 40 480" fill="none" stroke="white" strokeWidth="2" />
        <path d="M760 470 Q770 480 780 480" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ── Points explainer data ──────────────────────────────────────────────────
const POINTS_TABLE = [
  { label: 'Exact score prediction', pts: '+5 pts', color: '#10b981', icon: '⚡' },
  { label: 'Correct result (H/D/A)', pts: '+2 pts', color: '#2563eb', icon: '✓' },
  { label: '3 correct in a row (streak)', pts: '+3 pts', color: '#fbbf24', icon: '🔥' },
  { label: 'Wrong prediction', pts: '0 pts', color: '#4b5563', icon: '✗' },
];

// ── FAQ data ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How are winners chosen?',
    a: 'Winners are ranked by total points. Tiebreaker is most exact score predictions. Grand Champion is the player with most points at end of the group stage.',
  },
  {
    q: 'What happens if a match is cancelled?',
    a: 'Cancelled or postponed matches are removed from scoring. No points are awarded or deducted for those matches.',
  },
  {
    q: 'Is Transit Education affiliated with FIFA?',
    a: 'No. This is an independent promotional contest run by Transit Education. Transit Education is not affiliated with, sponsored by, or endorsed by FIFA.',
  },
  {
    q: 'Is there any payment required?',
    a: 'No. This contest is completely free to enter. All you need is an email address.',
  },
  {
    q: 'Who can play?',
    a: 'Any student or prospective student who signs up with a valid email address. Particularly open to Nepali students interested in studying abroad.',
  },
  {
    q: 'How does the exact score bonus work?',
    a: 'If you correctly predict both the home score and away score exactly (e.g. 2–1), you earn 5 points instead of the usual 2 for a correct result.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1f2937] last:border-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <span className={`flex-shrink-0 text-[#6b7280] transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="pb-4 text-sm text-[#9ca3af] leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
interface LandingClientProps {
  initialMatches: Match[];
  prizes: Prize[];
  initialLeaderboard: LeaderboardEntry[];
  openCount: number;
}

export default function LandingClient({
  initialMatches,
  prizes,
  initialLeaderboard,
  openCount,
}: LandingClientProps) {
  const { authModalOpen, isAuthenticated } = useContest();
  const [openMatches, setOpenMatches] = useState(
    initialMatches.filter(m => m.status === 'open').slice(0, 3)
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh open matches every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/contest/matches', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setOpenMatches((data.matches as Match[]).filter(m => m.status === 'open').slice(0, 3));
        }
      } catch { /* retain */ }
    }, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <FieldPattern />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-transparent to-[#0a0e1a] pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #1e3a8a30 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-full px-4 py-1.5 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
            </span>
            <span className="text-xs font-bold text-[#10b981] uppercase tracking-widest">
              Live · FIFA World Cup 2026
            </span>
            {openCount > 0 && (
              <span className="text-xs text-[#6b7280]">· {openCount} match{openCount !== 1 ? 'es' : ''} open</span>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-4"
          >
            Predict.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#0ea5e9]">
              Win.
            </span>
            {' '}Study Abroad.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#9ca3af] max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Predict exact scores for every World Cup 2026 group stage match.
            Climb the leaderboard. Win a MacBook Air M3, iPhone 15, scholarships and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={authModalOpen}
              className="w-full sm:w-auto bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-4 px-8 rounded-2xl transition-colors text-base shadow-lg shadow-blue-900/30"
            >
              {isAuthenticated ? '⚡ Predict now' : '🔑 Sign in & predict'}
            </button>
            <Link
              href="/predict/matches"
              className="w-full sm:w-auto bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] text-white font-semibold py-4 px-8 rounded-2xl transition-colors text-base text-center"
            >
              Browse all matches →
            </Link>
          </motion.div>

          {/* Prize teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-10 flex-wrap"
          >
            {[
              { emoji: '💻', label: 'MacBook Air M3', sub: 'Grand Prize' },
              { emoji: '📱', label: 'iPhone 15', sub: 'Runner Up' },
              { emoji: '🎓', label: 'Scholarship Package', sub: 'NPR 250,000 Value' },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-2">
                <span className="text-2xl">{p.emoji}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">{p.label}</p>
                  <p className="text-[10px] text-[#6b7280]">{p.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#4b5563]"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 10l5 5 5-5" />
          </svg>
        </motion.div>
      </section>

      {/* ── LIVE MATCHES STRIP ────────────────────────────────────── */}
      {openMatches.length > 0 && (
        <section className="px-4 py-12 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]" />
              </span>
              Open Now
            </h2>
            <Link href="/predict/matches" className="text-sm text-[#2563eb] hover:text-[#60a5fa] font-medium">
              All matches →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openMatches.map((m, i) => (
              <MatchCard key={m.id} match={{ ...m, prediction: null }} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="px-4 py-16 bg-[#080c15]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">How it works</h2>
            <p className="text-[#9ca3af] mt-3">Three simple steps to competing for the prizes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '📧',
                title: 'Sign in with email',
                desc: 'No password needed. Get a 6-digit code in your inbox and verify in seconds.',
              },
              {
                step: '02',
                icon: '⚽',
                title: 'Predict exact scores',
                desc: 'Submit your score prediction before kickoff. Locks are fair — everyone plays by the same rules.',
              },
              {
                step: '03',
                icon: '🏆',
                title: 'Earn points & climb',
                desc: 'Exact scores earn 5 pts. Correct result earns 2 pts. Hit 3 in a row for a streak bonus.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-[#111827] rounded-2xl p-6 border border-[#1f2937]"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <span className="absolute top-4 right-4 text-xs font-black text-[#1f2937] text-4xl">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[#9ca3af] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE SHOWCASE ───────────────────────────────────────── */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Prizes worth winning</h2>
          <p className="text-[#9ca3af] mt-3">Total prize pool worth over <span className="text-[#fbbf24] font-semibold">NPR 5,00,000</span></p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prizes.map((prize, i) => (
            <PrizeCard
              key={prize.id}
              prize={prize}
              featured={prize.tier === 'Grand Champion'}
              index={i}
            />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/predict/prizes"
            className="inline-flex items-center gap-2 text-sm text-[#2563eb] hover:text-[#60a5fa] font-medium"
          >
            View all prizes and timeline →
          </Link>
        </div>
      </section>

      {/* ── POINTS SYSTEM ───────────────────────────────────────── */}
      <section className="px-4 py-16 bg-[#080c15]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Points system</h2>
          </div>
          <div className="bg-[#111827] rounded-2xl border border-[#1f2937] overflow-hidden">
            {POINTS_TABLE.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-6 py-4 ${
                  i < POINTS_TABLE.length - 1 ? 'border-b border-[#1f2937]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{row.icon}</span>
                  <span className="text-sm text-[#e5e7eb]">{row.label}</span>
                </div>
                <span className="font-bold text-base" style={{ color: row.color }}>
                  {row.pts}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#4b5563] mt-4 text-center">
            Tiebreaker: most exact score predictions. Then most correct results. Then earliest signup.
          </p>
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ──────────────────────────────────── */}
      {initialLeaderboard.length > 0 && (
        <section className="px-4 py-16 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Current leaders</h2>
          </div>
          <Leaderboard initialEntries={initialLeaderboard} limit={5} />
        </section>
      )}

      {/* ── TRUST SIGNALS ───────────────────────────────────────── */}
      <section className="px-4 py-16 bg-[#080c15]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">How we keep it honest</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '⏱', title: 'Locks at kickoff', desc: 'Predictions lock 5 minutes before kickoff — fair for every player worldwide.' },
              { icon: '🎯', title: 'Verified results', desc: 'Match results are cross-checked from multiple sources before being entered.' },
              { icon: '🔒', title: 'Your data stays private', desc: 'Only your display name and city are public. Email is never shared.' },
              { icon: '✅', title: 'Points double-checked', desc: 'Scoring is automated and manually verified before leaderboard updates.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 bg-[#111827] rounded-2xl p-5 border border-[#1f2937]"
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-sm text-[#9ca3af]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSIT EDUCATION SERVICES STRIP ─────────────────────── */}
      <section className="px-4 py-8 bg-gradient-to-r from-[#1e3a8a]/40 to-[#0f172a]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#93c5fd] font-medium">Need help with your study abroad journey?</p>
            <p className="text-white font-semibold">Transit Education offers IELTS prep, SOP writing, visa guidance & more</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href="/services/test-preparation"
              className="text-xs font-semibold bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              IELTS Prep
            </Link>
            <Link
              href="/services/sop-writing"
              className="text-xs font-semibold bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              SOP Writing
            </Link>
            <Link
              href="/contact"
              className="text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">Frequently asked questions</h2>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-[#1f2937] px-6 divide-y divide-[#1f2937]">
          {FAQS.map(faq => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-3">
            {openCount > 0 ? `${openCount} match${openCount !== 1 ? 'es' : ''} open right now` : 'Matches opening soon'}
          </h2>
          <p className="text-[#9ca3af] mb-8">Start predicting and earn your first points today. It's free.</p>
          <button
            onClick={authModalOpen}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-4 px-10 rounded-2xl transition-colors text-lg shadow-lg shadow-blue-900/40"
          >
            {isAuthenticated ? '⚡ Go to matches' : '🏆 Start predicting for free'}
          </button>
        </div>
      </section>
    </div>
  );
}
