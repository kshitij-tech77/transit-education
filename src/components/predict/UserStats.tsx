'use client';

import Link from 'next/link';
import { useContest } from './ContestProvider';
import type { LeaderboardCache } from '@/types/contest';

interface UserStatsProps {
  leaderboard?: LeaderboardCache | null;
}

export default function UserStats({ leaderboard }: UserStatsProps) {
  const { user, isAuthenticated, authModalOpen } = useContest();

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={authModalOpen}
        className="w-full flex items-center justify-between bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3 hover:border-[#2563eb] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="text-sm text-[#9ca3af]">Sign in to track your rank</span>
        </div>
        <span className="text-xs text-[#2563eb] group-hover:text-[#60a5fa] font-medium">Sign in →</span>
      </button>
    );
  }

  const initials = user.display_name
    ? user.display_name.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <Link
      href="/predict/leaderboard"
      className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3 hover:border-[#2563eb] transition-colors"
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: user.avatar_color }}
      >
        {initials}
      </div>

      {/* Name + rank */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">
          {user.display_name || user.email.split('@')[0]}
        </p>
        {leaderboard && (
          <p className="text-xs text-[#6b7280]">
            {leaderboard.predictions_made} predictions
          </p>
        )}
      </div>

      {/* Points + rank */}
      {leaderboard && (
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className="text-sm font-bold text-[#2563eb]">
            {leaderboard.total_points} pts
          </span>
          {leaderboard.rank && (
            <span className="text-[11px] text-[#6b7280]">
              Rank #{leaderboard.rank}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
