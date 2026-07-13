"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { computeTierProgress, type LoyaltyTier } from "@/lib/loyalty-tiers";
import { usePortalUser } from "../layout";
import { PointsCard } from "@/components/portal/PointsCard";
import { TierProgressRing } from "@/components/portal/TierProgressRing";
import { TierLadder } from "@/components/portal/TierLadder";
import { QuickActions } from "@/components/portal/QuickActions";
import { ActivityList } from "@/components/portal/ActivityList";
import type { ActivityItem } from "@/components/portal/ActivityFeed";

interface Member {
  points_balance: number;
  lifetime_points_earned: number;
}

// Hardcoded — there's no benefits table in the schema, per the phase spec.
const TIER_BENEFITS: Record<LoyaltyTier, string> = {
  BRONZE: "Access to basic rewards",
  SILVER: "Priority support",
  GOLD: "Exclusive rewards",
  PLATINUM: "All rewards unlocked",
};

export default function PointsPage() {
  const { id: userId } = usePortalUser();

  const [member, setMember] = useState<Member | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { data: memberRow, error } = await supabase
        .from("loyalty_members")
        .select("points_balance, lifetime_points_earned")
        .eq("id", userId)
        .maybeSingle();

      // Same PostgREST-errors-on-unknown-column risk covered since Phase 3.
      if (error) {
        const fallback = await supabase
          .from("loyalty_members")
          .select("points_balance")
          .eq("id", userId)
          .maybeSingle();
        memberRow = fallback.data ? { ...fallback.data, lifetime_points_earned: 0 } : null;
      }

      setMember(memberRow ?? null);
      setLoading(false);
    })();
  }, [userId]);

  const loadEarnedActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/activity?limit=10");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActivity((data.items ?? []).filter((i: ActivityItem) => i.type === "EARN"));
    } catch {
      setActivity([]);
    }
  }, []);

  useEffect(() => { void loadEarnedActivity(); }, [loadEarnedActivity]);

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Points</h1>
        <p className="text-sm text-gray-600 mt-1">View your points balance and tier progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <PointsCard
            pointsBalance={member?.points_balance ?? 0}
            lifetimeEarned={member?.lifetime_points_earned ?? 0}
            hasLifetimeData={hasLifetimeData}
          />

          <TierProgressRing
            tier={tier}
            nextTier={nextTier}
            percentToNext={percentToNext}
            pointsToNext={pointsToNext}
            lifetimePoints={effectivePoints}
            hasLifetimeData={hasLifetimeData}
          />

          <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-6 space-y-4">
            <p className="text-lg font-semibold text-gray-800">Tier Benefits</p>
            <TierLadder tier={tier} />
            <div className="space-y-2 pt-1">
              {Object.entries(TIER_BENEFITS).map(([t, benefit]) => (
                <div key={t} className="flex items-center gap-2.5 text-sm">
                  <span className={`font-bold w-16 shrink-0 ${t === tier ? "text-brand" : "text-gray-400"}`}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </span>
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-6 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-semibold text-gray-800">Points History</p>
              <Link href="/portal/activity" className="text-[11px] font-semibold text-brand hover:underline">View All</Link>
            </div>
            <ActivityList items={activity} />
          </div>
        </div>

        <div className="space-y-4">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
