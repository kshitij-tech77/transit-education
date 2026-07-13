import { Check } from "lucide-react";
import { LOYALTY_TIERS, tierRank, TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty-tiers";

interface TierLadderProps {
  tier: LoyaltyTier;
}

const ASCENDING = [...LOYALTY_TIERS].sort((a, b) => a.minPoints - b.minPoints);

export function TierLadder({ tier }: TierLadderProps) {
  const currentRank = tierRank(tier);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ASCENDING.map(t => {
        const rank = tierRank(t.tier);
        const isCurrent = t.tier === tier;
        const isReached = rank <= currentRank;
        return (
          <div
            key={t.tier}
            className={`rounded-xl border p-3.5 text-center ${
              isCurrent ? "border-brand bg-brand-surface" : isReached ? "border-green-200 bg-green-50" : "border-[#E5E4E0]"
            }`}
          >
            {isReached && !isCurrent && <Check size={14} className="text-green-600 mx-auto mb-1" />}
            <p className={`text-[13px] font-extrabold ${isCurrent ? "text-brand" : "text-[#111]"}`}>{TIER_NAMES[t.tier]}</p>
            <p className="text-[10.5px] text-gray-400 mt-0.5">{t.minPoints}+ pts</p>
          </div>
        );
      })}
    </div>
  );
}
