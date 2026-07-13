import { LOYALTY_TIERS, tierForPoints, tierRank, type LoyaltyTier } from "@/lib/loyalty-tiers";

export const TIER_NAMES: Record<LoyaltyTier, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
};

const TIERS_ASCENDING = [...LOYALTY_TIERS].sort((a, b) => a.minPoints - b.minPoints);

export interface TierProgress {
  tier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNext: number;
  percentToNext: number;
}

// Percent/points-to-next are relative to the current tier's own band (not
// the raw point total), so a member just short of the next tier shows
// meaningful progress instead of a percentage dwarfed by earlier tiers'
// point requirements.
export function computeTierProgress(points: number): TierProgress {
  const tier = tierForPoints(points);
  const rank = tierRank(tier);
  const current = TIERS_ASCENDING[rank];
  const next = TIERS_ASCENDING[rank + 1] ?? null;

  if (!next) {
    return { tier, nextTier: null, pointsToNext: 0, percentToNext: 100 };
  }

  const span = next.minPoints - current.minPoints;
  const progressed = points - current.minPoints;
  const percentToNext = span > 0 ? Math.min(100, Math.max(0, (progressed / span) * 100)) : 100;

  return {
    tier,
    nextTier: next.tier,
    pointsToNext: Math.max(0, next.minPoints - points),
    percentToNext,
  };
}
