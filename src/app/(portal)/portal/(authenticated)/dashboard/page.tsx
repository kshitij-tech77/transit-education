"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Share2, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { tierRank, type LoyaltyTier } from "@/lib/loyalty-tiers";
import { computeTierProgress } from "@/lib/tier-progress";
import { usePortalUser } from "../layout";
import { WelcomeHeader } from "@/components/portal/WelcomeHeader";
import { JourneySteps, type JourneyMilestone } from "@/components/portal/JourneySteps";
import { TierProgressRing } from "@/components/portal/TierProgressRing";
import { RewardsCarousel } from "@/components/portal/RewardsCarousel";
import { MotivationalBanner } from "@/components/portal/MotivationalBanner";
import { TierCard } from "@/components/portal/TierCard";
import { PointsCard } from "@/components/portal/PointsCard";
import { ActivityFeed, type ActivityItem } from "@/components/portal/ActivityFeed";
import { QuickActions } from "@/components/portal/QuickActions";

interface Member {
  id: string;
  referral_code: string;
  points_balance: number;
  lifetime_points_earned: number;
}

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  stock: number | null;
  image_url: string | null;
  min_tier: LoyaltyTier | null;
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

export default function PortalDashboard() {
  const { id: userId, email } = usePortalUser();

  const [member, setMember] = useState<Member | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    let { data: memberRow, error: memberError } = await supabase
      .from("loyalty_members")
      .select("id, referral_code, points_balance, lifetime_points_earned")
      .eq("id", userId)
      .maybeSingle();

    // PostgREST errors the whole query when a selected column doesn't exist
    // yet — it doesn't just omit that field. If migration 005 hasn't landed
    // in this environment, lifetime_points_earned would fail the query above
    // entirely, so retry with the pre-005 column set rather than treating an
    // existing member as "not found" and re-registering them.
    if (memberError) {
      const fallback = await supabase
        .from("loyalty_members")
        .select("id, referral_code, points_balance")
        .eq("id", userId)
        .maybeSingle();
      memberRow = fallback.data ? { ...fallback.data, lifetime_points_earned: 0 } : null;
    }

    if (!memberRow) {
      // First login via the magic-link email skips handleVerify's register
      // call (that only runs on the 6-digit-code path), so create the
      // loyalty_members row here instead. Idempotent — see register/route.ts.
      const ref = new URLSearchParams(window.location.search).get("ref");
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: ref || undefined }),
      });
      if (res.ok) {
        const created = await res.json();
        memberRow = { id: created.id, referral_code: created.referralCode, points_balance: created.pointsBalance, lifetime_points_earned: 0 };
      }
    }

    let { data: rewardRows, error: rewardError } = await supabase
      .from("loyalty_rewards")
      .select("id, title, description, points_cost, stock, image_url, min_tier")
      .eq("active", true)
      .order("points_cost");

    // Same PostgREST-errors-on-unknown-column risk as above, but for an
    // already-live feature (reward redemption existed before the milestone
    // system) — without this fallback, an un-migrated environment would show
    // a fully empty rewards catalog instead of the pre-005 reward list.
    if (rewardError) {
      const fallback = await supabase
        .from("loyalty_rewards")
        .select("id, title, description, points_cost, stock, image_url")
        .eq("active", true)
        .order("points_cost");
      rewardRows = (fallback.data ?? []).map(r => ({ ...r, min_tier: null }));
    }

    const [{ data: milestoneRows }, { data: completionRows }] = await Promise.all([
      supabase.from("loyalty_milestones").select("id, title, description, icon, points, sort_order").eq("active", true).order("sort_order"),
      supabase.from("loyalty_milestone_completions").select("id, milestone_id, status").eq("member_id", userId).limit(100),
    ]);

    setMember(memberRow ?? null);
    setRewards(rewardRows ?? []);
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

  async function handleRedeem(rewardId: string) {
    setRedeemingId(rewardId);
    try {
      const { error } = await supabase.rpc("loyalty_redeem", { p_reward_id: rewardId });
      if (error) throw error;
      setToast("Reward requested! Staff will follow up shortly.");
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Couldn't redeem right now.");
    } finally {
      setRedeemingId(null);
    }
  }

  async function handleCopyReferral() {
    if (!member) return;
    await navigator.clipboard.writeText(`${window.location.origin}/portal/login?ref=${member.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  // Graceful fallback: lifetime_points_earned is 0 both when migration 005
  // hasn't run yet AND for any member who existed before it ran (the column
  // defaults to 0 for everyone, with no backfill from their prior
  // loyalty_transactions history) — in both cases points_balance is the more
  // truthful number to show and drive tier math from.
  const hasLifetimeData = (member?.lifetime_points_earned ?? 0) > 0;
  const effectivePoints = hasLifetimeData ? member!.lifetime_points_earned : (member?.points_balance ?? 0);
  const { tier, nextTier, pointsToNext, percentToNext } = computeTierProgress(effectivePoints);

  const completionByMilestone = new Map(completions.map(c => [c.milestone_id, c.status]));
  const journeyMilestones: JourneyMilestone[] = milestones.map(m => ({
    id: m.id,
    title: m.title,
    icon: m.icon,
    points: m.points,
    status: completionByMilestone.get(m.id) ?? "NOT_STARTED",
  }));

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <WelcomeHeader email={email} />

          <JourneySteps milestones={journeyMilestones} />

          <TierProgressRing
            tier={tier}
            nextTier={nextTier}
            percentToNext={percentToNext}
            pointsToNext={pointsToNext}
            lifetimePoints={effectivePoints}
            hasLifetimeData={hasLifetimeData}
          />

          <div className="bg-white rounded-2xl border border-[#E5E4E0] p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Share2 size={16} className="text-brand" />
              <h2 className="text-[14px] font-bold text-[#111]">Invite a Friend</h2>
            </div>
            <p className="text-[12px] text-gray-500">Share your referral code — you&apos;ll earn points when they join.</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px] font-bold bg-brand-surface text-brand px-4 py-2.5 rounded-lg">{member?.referral_code}</span>
              <button
                onClick={handleCopyReferral}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-brand bg-brand-surface px-3 py-2.5 rounded-lg hover:bg-brand hover:text-white transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>

          <RewardsCarousel
            rewards={rewards}
            tier={tier}
            pointsBalance={member?.points_balance ?? 0}
            redeemingId={redeemingId}
            onRedeem={handleRedeem}
          />

          <MotivationalBanner nextTier={nextTier} />
        </div>

        <div className="space-y-6">
          <TierCard tier={tier} nextTier={nextTier} pointsToNext={pointsToNext} percentToNext={percentToNext} />
          <PointsCard
            pointsBalance={member?.points_balance ?? 0}
            lifetimeEarned={member?.lifetime_points_earned ?? 0}
            hasLifetimeData={hasLifetimeData}
          />
          <ActivityFeed items={activity} />
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
