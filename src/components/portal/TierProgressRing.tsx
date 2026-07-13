import { Crown, Medal } from "lucide-react";
import { TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty-tiers";

interface TierProgressRingProps {
  tier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  percentToNext: number;
  pointsToNext: number;
  lifetimePoints: number;
  hasLifetimeData: boolean;
}

export function TierProgressRing({ tier, nextTier, percentToNext, pointsToNext, lifetimePoints, hasLifetimeData }: TierProgressRingProps) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentToNext / 100) * circumference;
  const Icon = tier === "GOLD" || tier === "PLATINUM" ? Crown : Medal;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-6 flex items-center gap-8 flex-wrap">
      <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F0EDEB" strokeWidth="13" />
          <circle
            cx="80" cy="80" r={radius} fill="none" stroke="var(--brand)" strokeWidth="13"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{Math.round(percentToNext)}%</span>
          <span className="text-xs text-gray-500">{nextTier ? `to ${TIER_NAMES[nextTier]}` : "top tier"}</span>
        </div>
      </div>

      <div className="space-y-2 min-w-[180px]">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Your Tier Progress</p>
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-brand" />
          <p className="text-lg font-semibold text-gray-800">{TIER_NAMES[tier]}</p>
        </div>
        <p className="text-sm text-gray-600">
          {hasLifetimeData ? `${lifetimePoints} Lifetime Points` : `${lifetimePoints} Points`}
        </p>
        {nextTier ? (
          <p className="text-sm text-gray-600">{pointsToNext} points to {TIER_NAMES[nextTier]}</p>
        ) : (
          <p className="text-sm text-gray-600">You&apos;ve reached the top tier</p>
        )}
        <span className="inline-block text-[11px] font-semibold text-gray-400 mt-1">View Tier Benefits →</span>
      </div>
    </div>
  );
}
