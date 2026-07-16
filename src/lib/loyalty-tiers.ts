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
