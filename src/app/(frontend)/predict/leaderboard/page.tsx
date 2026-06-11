'use client';

import { useState, useEffect } from 'react';
import Leaderboard from '@/components/predict/Leaderboard';
import UserStats from '@/components/predict/UserStats';
import { useContest } from '@/components/predict/ContestProvider';
import type { LeaderboardEntry, LeaderboardCache } from '@/types/contest';

export default function LeaderboardPage() {
  const { user } = useContest();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userLeaderboard, setUserLeaderboard] = useState<LeaderboardCache | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [lbRes, meRes] = await Promise.all([
          fetch('/api/contest/leaderboard?period=overall', { credentials: 'include' }),
          user ? fetch('/api/contest/me', { credentials: 'include' }) : null,
        ]);

        if (lbRes.ok) {
          const d = await lbRes.json();
          setEntries(d.entries || []);
        }

        if (meRes?.ok) {
          const d = await meRes.json();
          if (d.leaderboard) setUserLeaderboard(d.leaderboard);
        }
      } catch { /* noop */ } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);

  return (
    <div className="min-h-screen">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-lg border-b border-[#1f2937]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <UserStats leaderboard={userLeaderboard ?? undefined} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Leaderboard</h1>
          <p className="text-sm text-[#6b7280]">
            Updated every 30 seconds · Tiebreaker: most exact scores
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 bg-[#111827] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <Leaderboard initialEntries={entries} showFull />
        )}

        {/* Points system reminder */}
        <div className="mt-10 bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Points system</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '⚡', pts: '5 pts', label: 'Exact score' },
              { icon: '✓', pts: '2 pts', label: 'Correct result' },
              { icon: '🔥', pts: '+3 pts', label: '3-game streak' },
              { icon: '✗', pts: '0 pts', label: 'Wrong prediction' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center text-center gap-1 p-3 bg-[#0a0e1a] rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-bold text-white">{item.pts}</span>
                <span className="text-[10px] text-[#6b7280]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
