import { Gift, Lock } from "lucide-react";
import { tierRank, TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty-tiers";
import { EmptyState } from "./EmptyState";

export interface GridReward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  stock: number | null;
  image_url: string | null;
  min_tier: LoyaltyTier | null;
}

interface RewardsGridProps {
  rewards: GridReward[];
  tier: LoyaltyTier;
  pointsBalance: number;
  redeemingId: string | null;
  onRedeem: (reward: GridReward) => void;
}

export function RewardsGrid({ rewards, tier, pointsBalance, redeemingId, onRedeem }: RewardsGridProps) {
  if (rewards.length === 0) {
    return (
      <EmptyState
        icon={Gift}
        title="Rewards coming soon"
        subtitle="Exciting rewards are being prepared for you."
        cta={{ label: "Check Back Later", onClick: () => {} }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map(r => {
        // Graceful fallback: r.min_tier is undefined/null both when no tier
        // gate is set and when the min_tier column doesn't exist yet in
        // production (migration 005 not applied) — either way, unlocked.
        const tierMet = !r.min_tier || tierRank(tier) >= tierRank(r.min_tier);
        const locked = !tierMet;
        const outOfStock = r.stock !== null && r.stock <= 0;
        const lowStock = r.stock !== null && r.stock > 0 && r.stock < 5;
        const canAfford = pointsBalance >= r.points_cost;

        return (
          <div key={r.id} className={`bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-5 space-y-3 transition-all duration-200 ${locked ? "opacity-60" : "hover:shadow-md hover:scale-[1.02]"}`}>
            <div className="relative w-full aspect-[4/3] rounded-xl bg-brand-surface flex items-center justify-center text-brand overflow-hidden">
              {r.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
              ) : (
                <Gift size={28} />
              )}
              {lowStock && !outOfStock && (
                <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  Only {r.stock} left!
                </span>
              )}
            </div>

            <div>
              <p className="text-[14px] font-bold text-[#111]">{r.title}</p>
              {r.description && <p className="text-[12px] text-gray-400 mt-0.5">{r.description}</p>}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-brand shrink-0">{r.points_cost} Points</span>

              {locked ? (
                <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5 shrink-0">
                  <Lock size={12} /> Requires {TIER_NAMES[r.min_tier as LoyaltyTier]}
                </span>
              ) : (
                <button
                  onClick={() => onRedeem(r)}
                  disabled={!canAfford || outOfStock || redeemingId === r.id}
                  className="text-[11.5px] font-bold bg-brand text-white px-3.5 py-2 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {redeemingId === r.id ? "Redeeming…" : outOfStock ? "Out of stock" : !canAfford ? "Not enough points" : "Redeem"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
