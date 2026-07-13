import { Crown, Medal } from "lucide-react";
import { TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty-tiers";

interface InlineTierBadgeProps {
  tier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNext: number;
  percentToNext: number;
}

// A compact, glanceable companion to the sidebar TierCard — shown inline
// next to the welcome header so tier status is visible without looking at
// the sidebar. The sidebar TierCard stays as the more detailed version.
export function InlineTierBadge({ tier, nextTier, pointsToNext, percentToNext }: InlineTierBadgeProps) {
  const Icon = tier === "GOLD" || tier === "PLATINUM" ? Crown : Medal;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm px-5 py-3.5 min-w-[220px] shrink-0">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-brand" />
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Tier</span>
        <span className="text-sm font-semibold text-gray-900">{TIER_NAMES[tier]}</span>
      </div>
      {nextTier ? (
        <>
          <p className="text-xs text-gray-500 mt-1.5">{pointsToNext} points away from {TIER_NAMES[nextTier]}</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${percentToNext}%` }} />
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-500 mt-1.5">You&apos;ve reached the top tier!</p>
      )}
    </div>
  );
}
