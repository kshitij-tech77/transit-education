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
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentToNext / 100) * circumference;
  const Icon = tier === "GOLD" || tier === "PLATINUM" ? Crown : Medal;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] p-6 flex items-center gap-8 flex-wrap">
      <div className="relative w-[130px] h-[130px] shrink-0">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="#F0EDEB" strokeWidth="11" />
          <circle
            cx="65" cy="65" r={radius} fill="none" stroke="var(--brand)" strokeWidth="11"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 65 65)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-extrabold text-[#111]">{Math.round(percentToNext)}%</span>
          <span className="text-[9.5px] text-gray-400">{nextTier ? `to ${TIER_NAMES[nextTier]}` : "top tier"}</span>
        </div>
      </div>

      <div className="space-y-2 min-w-[180px]">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Your Tier Progress</p>
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-brand" />
          <p className="text-[15px] font-extrabold text-[#111]">{TIER_NAMES[tier]}</p>
        </div>
        <p className="text-[12px] text-gray-500">
          {hasLifetimeData ? `${lifetimePoints} Lifetime Points` : `${lifetimePoints} Points`}
        </p>
        {nextTier ? (
          <p className="text-[12px] text-gray-500">{pointsToNext} points to {TIER_NAMES[nextTier]}</p>
        ) : (
          <p className="text-[12px] text-gray-500">You&apos;ve reached the top tier</p>
        )}
        <span className="inline-block text-[11px] font-semibold text-gray-400 mt-1">View Tier Benefits →</span>
      </div>
    </div>
  );
}
