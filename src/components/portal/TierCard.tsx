import { Crown, Medal } from "lucide-react";
import { TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty-tiers";

interface TierCardProps {
  tier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNext: number;
  percentToNext: number;
}

export function TierCard({ tier, nextTier, pointsToNext, percentToNext }: TierCardProps) {
  const Icon = tier === "GOLD" || tier === "PLATINUM" ? Crown : Medal;

  return (
    <div className="bg-brand rounded-2xl p-5 text-white space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Current Tier</p>
          <p className="text-[18px] font-extrabold">{TIER_NAMES[tier]}</p>
        </div>
      </div>

      {nextTier ? (
        <>
          <p className="text-[12px] opacity-90">
            You&apos;re <span className="font-bold">{pointsToNext} points</span> away from {TIER_NAMES[nextTier]}
          </p>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${percentToNext}%` }} />
          </div>
        </>
      ) : (
        <p className="text-[12px] opacity-90">You&apos;ve reached the top tier!</p>
      )}
    </div>
  );
}
