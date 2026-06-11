'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useContest } from './ContestProvider';
import ShareCard from './ShareCard';
import type { LeaderboardEntry } from '@/types/contest';

type Period = 'overall' | 'weekly';

interface LeaderboardProps {
  initialEntries?: LeaderboardEntry[];
  showFull?: boolean;
  limit?: number;
}

function getInitials(entry: LeaderboardEntry): string {
  const name = entry.contest_users?.display_name || entry.contest_users?.email || '?';
  return name.slice(0, 2).toUpperCase();
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return (
    <span className="w-7 text-center text-sm font-bold text-[#6b7280] tabular-nums">
      {rank}
    </span>
  );
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 2) return null;

  const [second, first, third] = [top3[1], top3[0], top3[2]];

  return (
    <div className="flex items-end justify-center gap-2 mb-6">
      {/* 2nd */}
      {second && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-2 w-28"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white ring-2 ring-[#9ca3af]"
            style={{ backgroundColor: second.contest_users?.avatar_color || '#374151' }}
          >
            {getInitials(second)}
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-white truncate max-w-[7rem]">
              {second.contest_users?.display_name || 'Anonymous'}
            </p>
            <p className="text-[10px] text-[#9ca3af]">{second.total_points} pts</p>
          </div>
          <div className="w-full h-16 bg-[#1f2937] rounded-t-lg flex items-center justify-center">
            <span className="text-2xl">🥈</span>
          </div>
        </motion.div>
      )}

      {/* 1st */}
      {first && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="flex flex-col items-center gap-2 w-28"
        >
          <span className="text-2xl">👑</span>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ring-3 ring-[#fbbf24] ring-offset-2 ring-offset-[#0a0e1a]"
            style={{ backgroundColor: first.contest_users?.avatar_color || '#374151', boxShadow: '0 0 20px #fbbf2440' }}
          >
            {getInitials(first)}
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white truncate max-w-[7rem]">
              {first.contest_users?.display_name || 'Anonymous'}
            </p>
            <p className="text-xs text-[#fbbf24] font-semibold">{first.total_points} pts</p>
          </div>
          <div className="w-full h-24 bg-[#1e3a5f] rounded-t-lg flex items-center justify-center border-t-2 border-[#fbbf24]">
            <span className="text-2xl">🥇</span>
          </div>
        </motion.div>
      )}

      {/* 3rd */}
      {third && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2 w-28"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white ring-2 ring-[#d97706]"
            style={{ backgroundColor: third.contest_users?.avatar_color || '#374151' }}
          >
            {getInitials(third)}
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-white truncate max-w-[7rem]">
              {third.contest_users?.display_name || 'Anonymous'}
            </p>
            <p className="text-[10px] text-[#9ca3af]">{third.total_points} pts</p>
          </div>
          <div className="w-full h-10 bg-[#1f2937] rounded-t-lg flex items-center justify-center">
            <span className="text-2xl">🥉</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Leaderboard({ initialEntries = [], showFull, limit = 5 }: LeaderboardProps) {
  const { user } = useContest();
  const [period, setPeriod] = useState<Period>('overall');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLeaderboard = async (p: Period) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/contest/leaderboard?period=${p}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch {
      // retain existing entries
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showFull) {
      fetchLeaderboard(period);
    }
  }, [period, showFull]);

  useEffect(() => {
    if (!showFull) return;
    intervalRef.current = setInterval(() => fetchLeaderboard(period), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [period, showFull]);

  const displayed = showFull ? entries : entries.slice(0, limit);

  // Find current user's entry
  const myEntry = user ? entries.find(e => e.user_id === user.id) : null;

  return (
    <div className="flex flex-col gap-4">
      {showFull && (
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-xl p-1 self-start">
          {(['overall', 'weekly'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                period === p
                  ? 'bg-[#2563eb] text-white'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              {p === 'weekly' ? 'This Week' : 'Overall'}
            </button>
          ))}
        </div>
      )}

      {showFull && <Podium entries={displayed} />}

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-[#1f2937]">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-2.5 bg-[#0a0e1a] text-[10px] font-bold uppercase tracking-widest text-[#4b5563]">
          <span className="w-7">#</span>
          <span>Player</span>
          <span className="text-center w-10">✓</span>
          <span className="text-center w-10">⚡</span>
          <span className="text-center w-14 text-[#fbbf24]">Pts</span>
        </div>

        <AnimatePresence>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3 border-t border-[#1f2937] animate-pulse">
                  <div className="h-4 bg-[#1f2937] rounded w-3/4" />
                </div>
              ))
            : displayed.map((entry, i) => {
                const isMe = user && entry.user_id === user.id;
                const initials = getInitials(entry);
                return (
                  <motion.div
                    key={entry.user_id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 items-center px-4 py-3 border-t border-[#1f2937] ${
                      isMe ? 'bg-[#1e3a5f]/40' : i % 2 === 0 ? 'bg-[#0a0e1a]' : 'bg-[#111827]'
                    }`}
                  >
                    <div className="w-7 flex justify-center">
                      <RankMedal rank={entry.rank ?? i + 1} />
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: entry.contest_users?.avatar_color || '#374151' }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? 'text-[#60a5fa]' : 'text-white'}`}>
                          {entry.contest_users?.display_name || 'Anonymous'}
                          {isMe && <span className="ml-1 text-[10px] text-[#60a5fa]">(you)</span>}
                        </p>
                        {entry.contest_users?.city && (
                          <p className="text-[11px] text-[#4b5563] truncate">{entry.contest_users.city}</p>
                        )}
                      </div>
                    </div>

                    <span className="text-center text-sm text-[#9ca3af] tabular-nums w-10">
                      {entry.correct_results}
                    </span>
                    <span className="text-center text-sm text-[#fbbf24] tabular-nums w-10">
                      {entry.exact_scores}
                    </span>
                    <span className="text-center text-sm font-bold text-white tabular-nums w-14">
                      {period === 'weekly' ? entry.weekly_points : entry.total_points}
                    </span>
                  </motion.div>
                );
              })
          }
        </AnimatePresence>

        {displayed.length === 0 && !isLoading && (
          <div className="px-4 py-8 text-center text-[#6b7280] text-sm">
            No entries yet. Be the first to predict!
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {!showFull && entries.length > limit && (
          <Link
            href="/predict/leaderboard"
            className="text-sm text-[#2563eb] hover:text-[#60a5fa] font-medium transition-colors"
          >
            View full leaderboard →
          </Link>
        )}

        {myEntry && (
          <button
            onClick={() => setShareOpen(v => !v)}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-[#9ca3af] hover:text-white bg-[#1f2937] hover:bg-[#374151] px-3 py-2 rounded-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            Share my rank
          </button>
        )}
      </div>

      {shareOpen && myEntry && (
        <ShareCard
          displayName={myEntry.contest_users?.display_name || 'Player'}
          rank={myEntry.rank}
          totalPoints={myEntry.total_points}
        />
      )}
    </div>
  );
}
