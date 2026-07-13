// Thresholds are placeholders inspired by the CEO's sample journey — confirm
// final numbers with him before treating these as settled.
export const LOYALTY_TIERS = [
  { tier: 'PLATINUM', minPoints: 46 },
  { tier: 'GOLD', minPoints: 26 },
  { tier: 'SILVER', minPoints: 11 },
  { tier: 'BRONZE', minPoints: 0 },
] as const;

export type LoyaltyTier = typeof LOYALTY_TIERS[number]['tier'];

export function tierForPoints(points: number): LoyaltyTier {
  return LOYALTY_TIERS.find(t => points >= t.minPoints)!.tier;
}

// Ascending rank (BRONZE=0 ... PLATINUM=3), independent of LOYALTY_TIERS'
// high-to-low array order (which exists so tierForPoints can take the first match).
const TIERS_ASCENDING = [...LOYALTY_TIERS].sort((a, b) => a.minPoints - b.minPoints);

export function tierRank(tier: LoyaltyTier): number {
  return TIERS_ASCENDING.findIndex(t => t.tier === tier);
}

export const TIER_NAMES: Record<LoyaltyTier, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
};

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
