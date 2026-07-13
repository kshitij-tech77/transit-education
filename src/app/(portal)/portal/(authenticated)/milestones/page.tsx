"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Gift, Users, Activity as ActivityIcon, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { computeTierProgress } from "@/lib/loyalty-tiers";
import { usePortalUser } from "../layout";
import { TierCard } from "@/components/portal/TierCard";
import { PointsCard } from "@/components/portal/PointsCard";
import { ActivityFeed, type ActivityItem } from "@/components/portal/ActivityFeed";
import { QuickActions, type QuickAction } from "@/components/portal/QuickActions";
import { MilestoneTimeline } from "@/components/portal/MilestoneTimeline";
import { MilestoneProgress } from "@/components/portal/MilestoneProgress";
import type { MilestoneRowData } from "@/components/portal/MilestoneRow";

interface Member {
  points_balance: number;
  lifetime_points_earned: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  points: number;
  sort_order: number;
}

interface Completion {
  id: string;
  milestone_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const MILESTONES_PAGE_ACTIONS: QuickAction[] = [
  { href: "/portal/rewards", label: "View Rewards", icon: Gift },
  { href: "/portal/referrals", label: "Refer a Friend", icon: Users },
  { href: "/portal/activity", label: "My Activity", icon: ActivityIcon },
  { href: "/portal/profile", label: "Update Profile", icon: User },
];

export default function MilestonesPage() {
  const { id: userId } = usePortalUser();

  const [member, setMember] = useState<Member | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    let { data: memberRow, error: memberError } = await supabase
      .from("loyalty_members")
      .select("points_balance, lifetime_points_earned")
      .eq("id", userId)
      .maybeSingle();

    // Same PostgREST-errors-on-unknown-column risk covered in the dashboard
    // (Phase 3) — retry with the pre-005 column set rather than a blank page.
    if (memberError) {
      const fallback = await supabase
        .from("loyalty_members")
        .select("points_balance")
        .eq("id", userId)
        .maybeSingle();
      memberRow = fallback.data ? { ...fallback.data, lifetime_points_earned: 0 } : null;
    }

    // loyalty_milestones / loyalty_milestone_completions are entirely new
    // tables (migration 005). Unlike the column-fallback above, there's no
    // smaller working column set to retry with if the tables themselves
    // don't exist yet — the query just errors, data comes back null, and
    // `?? []` below already degrades to MilestoneTimeline's empty state.
    const [{ data: milestoneRows }, { data: completionRows }] = await Promise.all([
      supabase.from("loyalty_milestones").select("id, title, description, icon, points, sort_order").eq("active", true).order("sort_order"),
      supabase.from("loyalty_milestone_completions").select("id, milestone_id, status").eq("member_id", userId).limit(100),
    ]);

    setMember(memberRow ?? null);
    setMilestones(milestoneRows ?? []);
    setCompletions(completionRows ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    fetch("/api/portal/activity?limit=5")
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => setActivity(data.items ?? []))
      .catch(() => setActivity([]));
  }, [userId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleClaim(milestoneId: string) {
    setClaimingId(milestoneId);
    // Optimistic update: flip this milestone to PENDING ("In Progress")
    // immediately, since claims go through staff review rather than
    // completing instantly. Rolled back on failure below.
    const previous = completions;
    setCompletions(prev => [
      ...prev.filter(c => c.milestone_id !== milestoneId),
      { id: `optimistic-${milestoneId}`, milestone_id: milestoneId, status: "PENDING" },
    ]);

    try {
      // Body shape must match ClaimSchema in api/portal/milestones/claim/route.ts: { milestoneId: string }
      const res = await fetch("/api/portal/milestones/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId }),
      });
      if (!res.ok) throw new Error(res.status === 409 ? "Already claimed" : "Couldn't submit claim");
      setToast("Submitted! Staff will review shortly.");
      await load();
    } catch (err) {
      setCompletions(previous);
      setToast(err instanceof Error ? err.message : "Couldn't submit claim");
    } finally {
      setClaimingId(null);
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

  const completionByMilestone = new Map(completions.map(c => [c.milestone_id, c.status]));
  const rows: MilestoneRowData[] = milestones.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    icon: m.icon,
    points: m.points,
    status: completionByMilestone.get(m.id) ?? "NOT_STARTED",
  }));
  const completedCount = rows.filter(r => r.status === "APPROVED").length;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111]">Milestones</h1>
        <p className="text-[13px] text-gray-500 mt-1">Complete milestones to earn points and unlock amazing rewards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <div className="bg-white rounded-2xl border border-[#E5E4E0] p-6">
            <div className="mb-5">
              <p className="text-[14px] font-bold text-[#111]">Your Milestones Journey</p>
              <p className="text-[11px] text-gray-400">Track your progress and complete milestones on your study abroad journey.</p>
            </div>

            <MilestoneTimeline milestones={rows} claimingId={claimingId} onClaim={handleClaim} />
          </div>

          <MilestoneProgress completedCount={completedCount} totalCount={rows.length} nextTier={nextTier} />
        </div>

        <div className="space-y-6">
          <TierCard tier={tier} nextTier={nextTier} pointsToNext={pointsToNext} percentToNext={percentToNext} />
          <PointsCard
            pointsBalance={member?.points_balance ?? 0}
            lifetimeEarned={member?.lifetime_points_earned ?? 0}
            hasLifetimeData={hasLifetimeData}
          />
          <ActivityFeed items={activity} />
          <QuickActions actions={MILESTONES_PAGE_ACTIONS} />
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
