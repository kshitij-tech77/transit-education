"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { computeTierProgress } from "@/lib/loyalty-tiers";
import { usePortalUser } from "../layout";
import { TierCard } from "@/components/portal/TierCard";
import { PointsCard } from "@/components/portal/PointsCard";
import { QuickActions } from "@/components/portal/QuickActions";
import { RewardsGrid, type GridReward } from "@/components/portal/RewardsGrid";

interface Member {
  points_balance: number;
  lifetime_points_earned: number;
}

export default function RewardsPage() {
  const { id: userId } = usePortalUser();

  const [member, setMember] = useState<Member | null>(null);
  const [rewards, setRewards] = useState<GridReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    let { data: memberRow, error: memberError } = await supabase
      .from("loyalty_members")
      .select("points_balance, lifetime_points_earned")
      .eq("id", userId)
      .maybeSingle();

    // Same PostgREST-errors-on-unknown-column risk covered since Phase 3.
    if (memberError) {
      const fallback = await supabase
        .from("loyalty_members")
        .select("points_balance")
        .eq("id", userId)
        .maybeSingle();
      memberRow = fallback.data ? { ...fallback.data, lifetime_points_earned: 0 } : null;
    }

    let { data: rewardRows, error: rewardError } = await supabase
      .from("loyalty_rewards")
      .select("id, title, description, points_cost, stock, image_url, min_tier")
      .eq("active", true)
      .order("points_cost");

    // Same fallback for the already-live reward catalog if min_tier doesn't
    // exist yet — without it this page would show zero rewards pre-migration.
    if (rewardError) {
      const fallback = await supabase
        .from("loyalty_rewards")
        .select("id, title, description, points_cost, stock, image_url")
        .eq("active", true)
        .order("points_cost");
      rewardRows = (fallback.data ?? []).map(r => ({ ...r, min_tier: null }));
    }

    setMember(memberRow ?? null);
    setRewards(rewardRows ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleRedeem(reward: GridReward) {
    if (!window.confirm(`Redeem ${reward.title} for ${reward.points_cost} points?`)) return;
    setRedeemingId(reward.id);
    try {
      const { error } = await supabase.rpc("loyalty_redeem", { p_reward_id: reward.id });
      if (error) throw error;
      setToast("Reward requested! Staff will follow up shortly.");
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Couldn't redeem right now.");
    } finally {
      setRedeemingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  const hasLifetimeData = (member?.lifetime_points_earned ?? 0) > 0;
  const effectivePoints = hasLifetimeData ? member!.lifetime_points_earned : (member?.points_balance ?? 0);
  const { tier, nextTier, pointsToNext, percentToNext } = computeTierProgress(effectivePoints);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Rewards</h1>
        <p className="text-sm text-gray-600 mt-1">Redeem your points for exclusive rewards and experiences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="min-w-0">
          <RewardsGrid
            rewards={rewards}
            tier={tier}
            pointsBalance={member?.points_balance ?? 0}
            redeemingId={redeemingId}
            onRedeem={handleRedeem}
          />
        </div>

        <div className="space-y-4">
          <TierCard tier={tier} nextTier={nextTier} pointsToNext={pointsToNext} percentToNext={percentToNext} />
          <PointsCard
            pointsBalance={member?.points_balance ?? 0}
            lifetimeEarned={member?.lifetime_points_earned ?? 0}
            hasLifetimeData={hasLifetimeData}
          />
          <QuickActions />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#111] text-white px-5 py-3 rounded-xl shadow-2xl text-[12px] font-medium max-w-xs">{toast}</div>
        </div>
      )}
    </div>
  );
}
