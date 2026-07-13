"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Lock, Loader2 } from "lucide-react";
import { tierRank, type LoyaltyTier } from "@/lib/loyalty-tiers";
import { TIER_NAMES } from "@/lib/tier-progress";

interface CarouselReward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  stock: number | null;
  image_url: string | null;
  min_tier: LoyaltyTier | null;
}

interface RewardsCarouselProps {
  rewards: CarouselReward[];
  tier: LoyaltyTier;
  pointsBalance: number;
  redeemingId: string | null;
  onRedeem: (rewardId: string) => void;
}

const DESKTOP_PAGE_SIZE = 4;
const MOBILE_PAGE_SIZE = 2;

export function RewardsCarousel({ rewards, tier, pointsBalance, redeemingId, onRedeem }: RewardsCarouselProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const update = () => setPageSize(mql.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const pageCount = Math.max(1, Math.ceil(rewards.length / pageSize));
  // Clamp rather than reset to 0 — a resize shouldn't yank the user back to
  // the first page if their current one is still in range at the new size.
  const safePage = Math.min(page, pageCount - 1);
  const visible = rewards.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold text-[#111]">Featured Rewards</p>
        <Link href="/portal/rewards" className="text-[11px] font-semibold text-brand hover:underline">View All</Link>
      </div>

      {rewards.length === 0 ? (
        <p className="text-[12px] text-gray-400 text-center py-8">No rewards available yet — check back soon.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {visible.map(r => {
              const canAfford = pointsBalance >= r.points_cost;
              const outOfStock = r.stock !== null && r.stock <= 0;
              // Graceful fallback: r.min_tier is undefined/null both when no
              // tier gate is set AND when the min_tier column doesn't exist
              // yet in production (migration 005 not applied) — either way
              // the reward reads as unlocked.
              const tierMet = !r.min_tier || tierRank(tier) >= tierRank(r.min_tier);
              const locked = !tierMet;
              return (
                <div key={r.id} className="border border-[#E5E4E0] rounded-xl p-3 space-y-2 relative">
                  {locked && (
                    <span className="absolute top-2 right-2 text-[8.5px] font-bold uppercase tracking-wide bg-gray-800/80 text-white px-1.5 py-0.5 rounded-full">
                      {TIER_NAMES[r.min_tier as LoyaltyTier]}
                    </span>
                  )}
                  <div className="w-full aspect-square rounded-lg bg-brand-surface flex items-center justify-center text-brand overflow-hidden">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <Gift size={22} />
                    )}
                  </div>
                  <p className="text-[11.5px] font-bold text-[#111] leading-tight line-clamp-2">{r.title}</p>
                  <p className="text-[10.5px] font-semibold text-brand">{r.points_cost} Points</p>
                  <button
                    onClick={() => !locked && onRedeem(r.id)}
                    disabled={locked || !canAfford || outOfStock || redeemingId === r.id}
                    className="w-full text-[10.5px] font-bold border border-brand text-brand py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {redeemingId === r.id ? <Loader2 className="animate-spin" size={11} />
                      : locked ? <><Lock size={10} /> Locked</>
                      : outOfStock ? "Out of stock"
                      : !canAfford ? "Not enough" : "Redeem"}
                  </button>
                </div>
              );
            })}
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  aria-label={`Page ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === safePage ? "bg-brand" : "bg-gray-200"}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
