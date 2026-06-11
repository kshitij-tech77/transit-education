'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MatchCard from '@/components/predict/MatchCard';
import UserStats from '@/components/predict/UserStats';
import GroupStandings from '@/components/predict/GroupStandings';
import { useContest } from '@/components/predict/ContestProvider';
import type { MatchWithPrediction, Prediction } from '@/types/contest';

type StatusFilter = 'all' | 'open' | 'locked' | 'settled';
type GroupFilter = 'all' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: '🟢 Open' },
  { value: 'locked', label: '🟡 Locked' },
  { value: 'settled', label: '✓ Settled' },
];

const GROUPS: GroupFilter[] = ['all', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function MatchesPage() {
  const { user } = useContest();
  const [matches, setMatches] = useState<MatchWithPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [userLeaderboard, setUserLeaderboard] = useState<{ total_points: number; rank: number | null; predictions_made: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/contest/matches', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch { /* retain */ } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/contest/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard) setUserLeaderboard(data.leaderboard);
      }
    } catch { /* noop */ }
  };

  useEffect(() => {
    fetchMatches();
    fetchUserData();
  }, [user?.id]);

  useEffect(() => {
    intervalRef.current = setInterval(fetchMatches, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handlePredictionSaved = (matchId: string, prediction: Prediction) => {
    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, prediction } : m
    ));
  };

  const filtered = matches.filter(m => {
    const statusOk = statusFilter === 'all' || m.status === statusFilter;
    const groupOk  = groupFilter === 'all' || m.group_name === groupFilter;
    return statusOk && groupOk;
  });

  const settledGroupsInFilter = groupFilter !== 'all'
    ? matches.filter(m => m.group_name === groupFilter && m.status === 'settled')
    : [];

  return (
    <div className="min-h-screen">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-lg border-b border-[#1f2937]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* User stats */}
          <UserStats leaderboard={userLeaderboard ?? undefined} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">All Matches</h1>
          <p className="text-sm text-[#6b7280]">FIFA World Cup 2026 Group Stage · {matches.length} matches</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Status filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  statusFilter === f.value
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-[#111827] border border-[#1f2937] text-[#9ca3af] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Group filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  groupFilter === g
                    ? 'bg-[#1f2937] text-white'
                    : 'text-[#4b5563] hover:text-[#9ca3af]'
                }`}
              >
                {g === 'all' ? 'All Groups' : `Group ${g}`}
              </button>
            ))}
          </div>
        </div>

        {/* Group standings (only when a specific group is selected and has settled matches) */}
        {groupFilter !== 'all' && settledGroupsInFilter.length > 0 && (
          <div className="mb-6">
            <GroupStandings matches={matches} groupName={groupFilter} />
          </div>
        )}

        {/* Match cards */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-[#111827] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-4xl mb-4">⚽</p>
            <p className="text-[#9ca3af] text-sm">No matches found for the selected filters.</p>
            <button
              onClick={() => { setStatusFilter('all'); setGroupFilter('all'); }}
              className="mt-4 text-[#2563eb] text-sm font-medium"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((m, i) => (
              <MatchCard
                key={m.id}
                match={m}
                index={i}
                onPredictionSaved={handlePredictionSaved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
