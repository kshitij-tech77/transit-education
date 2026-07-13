"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { computeTierProgress } from "@/lib/tier-progress";
import { usePortalUser } from "../layout";
import { TierCard } from "@/components/portal/TierCard";
import { PointsCard } from "@/components/portal/PointsCard";
import { QuickActions } from "@/components/portal/QuickActions";
import { ActivityList } from "@/components/portal/ActivityList";
import type { ActivityItem } from "@/components/portal/ActivityFeed";

interface Member {
  points_balance: number;
  lifetime_points_earned: number;
}

type Filter = "ALL" | "EARN" | "REDEEM";
const PAGE_SIZE = 20;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "EARN", label: "Earned" },
  { key: "REDEEM", label: "Redeemed" },
];

export default function ActivityPage() {
  const { id: userId } = usePortalUser();

  const [member, setMember] = useState<Member | null>(null);
  const [memberLoading, setMemberLoading] = useState(true);

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [activityLoading, setActivityLoading] = useState(true);

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
      setMemberLoading(false);
    })();
  }, [userId]);

  const loadActivity = useCallback(async (targetPage: number) => {
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/portal/activity?page=${targetPage}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => { void loadActivity(page); }, [page, loadActivity]);

  if (memberLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  const hasLifetimeData = (member?.lifetime_points_earned ?? 0) > 0;
  const effectivePoints = hasLifetimeData ? member!.lifetime_points_earned : (member?.points_balance ?? 0);
  const { tier, nextTier, pointsToNext, percentToNext } = computeTierProgress(effectivePoints);

  // Filters apply to the currently-loaded page only, not the whole dataset —
  // pagination is server-side against the unfiltered feed, so switching to
  // "Earned" on a page dominated by redemptions can show very few rows even
  // though earlier/later pages have more. A cleaner fix would filter
  // server-side (the endpoint would need a type param), but that's a Phase 8
  // concern, not part of this polish pass.
  const filteredItems = filter === "ALL" ? items : items.filter(i => i.type === filter);
  const hasPrev = page > 1;
  const hasNext = page * PAGE_SIZE < total;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111]">My Activity</h1>
        <p className="text-[13px] text-gray-500 mt-1">Track your points history and milestone progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="bg-white rounded-2xl border border-[#E5E4E0] p-6 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  filter === f.key ? "bg-brand text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {activityLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-brand" size={28} />
            </div>
          ) : (
            <ActivityList items={filteredItems} />
          )}

          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!hasPrev || activityLoading}
                className="flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-[11.5px] text-gray-400">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNext || activityLoading}
                className="flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <TierCard tier={tier} nextTier={nextTier} pointsToNext={pointsToNext} percentToNext={percentToNext} />
          <PointsCard
            pointsBalance={member?.points_balance ?? 0}
            lifetimeEarned={member?.lifetime_points_earned ?? 0}
            hasLifetimeData={hasLifetimeData}
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
