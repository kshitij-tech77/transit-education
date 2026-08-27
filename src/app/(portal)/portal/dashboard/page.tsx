"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Gift, Copy, Check, LogOut, Share2, Flag, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { tierForPoints, tierRank, type LoyaltyTier } from "@/lib/loyalty-tiers";

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

interface Redemption {
  id: string;
  reward_id: string;
  points_spent: number;
  status: "PENDING" | "FULFILLED" | "REJECTED";
  created_at: string;
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

const TIER_LABELS: Record<LoyaltyTier, string> = {
  BRONZE: "🥉 Bronze",
  SILVER: "🥈 Silver",
  GOLD: "🥇 Gold",
  PLATINUM: "💎 Platinum",
};

export default function PortalDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/portal/login");
      return;
    }
    setEmail(user.email ?? null);

    let { data: memberRow } = await supabase
      .from("loyalty_members")
      .select("id, referral_code, points_balance, lifetime_points_earned")
      .eq("id", user.id)
      .maybeSingle();

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

    const [{ data: rewardRows }, { data: redemptionRows }, { data: milestoneRows }, { data: completionRows }] = await Promise.all([
      supabase.from("loyalty_rewards").select("id, title, description, points_cost, stock, image_url, min_tier").eq("active", true).order("points_cost"),
      // Per-user history, restricted to the caller's own rows by RLS
      // ("redemptions select own" policy) — bounded defensively regardless.
      supabase.from("loyalty_redemptions").select("id, reward_id, points_spent, status, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("loyalty_milestones").select("id, title, description, icon, points, sort_order").eq("active", true).order("sort_order"),
      supabase.from("loyalty_milestone_completions").select("id, milestone_id, status").eq("member_id", user.id).limit(100),
    ]);

    setMember(memberRow ?? null);
    setRewards(rewardRows ?? []);
    setRedemptions(redemptionRows ?? []);
    setMilestones(milestoneRows ?? []);
    setCompletions(completionRows ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { void load(); }, [load]);

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

  async function handleClaim(milestoneId: string) {
    setClaimingId(milestoneId);
    try {
      const res = await fetch("/api/portal/milestones/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId }),
      });
      if (!res.ok) throw new Error(res.status === 409 ? "Already claimed" : "Couldn't submit claim");
      setToast("Submitted! Staff will review shortly.");
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Couldn't submit claim");
    } finally {
      setClaimingId(null);
    }
  }

  async function handleCopyReferral() {
    if (!member) return;
    await navigator.clipboard.writeText(`${window.location.origin}/portal/login?ref=${member.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  const tier = tierForPoints(member?.lifetime_points_earned ?? 0);
  const completionByMilestone = new Map(completions.map(c => [c.milestone_id, c.status]));

  return (
    <div className="min-h-screen bg-off-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#111]">Transit Rewards</h1>
            <p className="text-[12px] text-gray-500">{email}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-brand transition-colors flex items-center gap-1.5 text-[12px] font-semibold">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="bg-brand rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Your Points Balance</p>
            <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full">{TIER_LABELS[tier]}</span>
          </div>
          <p className="text-[42px] font-extrabold leading-tight">{member?.points_balance ?? 0}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E4E0] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-brand" />
            <h2 className="text-[14px] font-bold text-[#111]">Invite a Friend</h2>
          </div>
          <p className="text-[12px] text-gray-500">Share your referral code — you'll earn points when they join.</p>
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

        <div className="space-y-3">
          <h2 className="text-[14px] font-bold text-[#111]">Your Journey</h2>
          {milestones.length === 0 && (
            <p className="text-[12px] text-gray-400 bg-white border border-[#E5E4E0] rounded-2xl p-6 text-center">No milestones yet — check back soon.</p>
          )}
          <div className="bg-white rounded-2xl border border-[#E5E4E0] divide-y divide-gray-100">
            {milestones.map(m => {
              const status = completionByMilestone.get(m.id);
              return (
                <div key={m.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 text-[15px]">
                      {m.icon || <Flag size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#111] truncate">{m.title}</p>
                      {m.description && <p className="text-[11px] text-gray-400 truncate">{m.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-brand">{m.points} pts</span>
                    {status === "APPROVED" && <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-green-100 text-green-700">Done</span>}
                    {status === "PENDING" && <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending</span>}
                    {(status === undefined || status === "REJECTED") && (
                      <button
                        onClick={() => handleClaim(m.id)}
                        disabled={claimingId === m.id}
                        className="text-[11px] font-bold bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40 flex items-center gap-1.5"
                      >
                        {claimingId === m.id ? <Loader2 className="animate-spin" size={12} /> : "Mark as done"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[14px] font-bold text-[#111]">Redeem Rewards</h2>
          {rewards.length === 0 && (
            <p className="text-[12px] text-gray-400 bg-white border border-[#E5E4E0] rounded-2xl p-6 text-center">No rewards available yet — check back soon.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map(r => {
              const canAfford = (member?.points_balance ?? 0) >= r.points_cost;
              const outOfStock = r.stock !== null && r.stock <= 0;
              const tierMet = !r.min_tier || tierRank(tier) >= tierRank(r.min_tier);
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-[#E5E4E0] p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                      <Gift size={16} />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-bold text-[#111]">{r.title}</p>
                      {r.description && <p className="text-[11px] text-gray-400">{r.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-brand">{r.points_cost} pts</span>
                    <button
                      onClick={() => handleRedeem(r.id)}
                      disabled={!canAfford || !tierMet || outOfStock || redeemingId === r.id}
                      className="text-[11px] font-bold bg-brand text-white px-3.5 py-2 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {redeemingId === r.id ? <Loader2 className="animate-spin" size={12} />
                        : outOfStock ? "Out of stock"
                        : !tierMet ? <><Lock size={11} /> Reach {TIER_LABELS[r.min_tier as LoyaltyTier]}</>
                        : canAfford ? "Redeem" : "Not enough points"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {redemptions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[14px] font-bold text-[#111]">Your Redemption History</h2>
            <div className="bg-white rounded-2xl border border-[#E5E4E0] divide-y divide-gray-100">
              {redemptions.map(rd => (
                <div key={rd.id} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[12px] text-gray-600">{new Date(rd.created_at).toLocaleDateString()} — {rd.points_spent} pts</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    rd.status === "FULFILLED" ? "bg-green-100 text-green-700"
                    : rd.status === "REJECTED" ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>{rd.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#111] text-white px-5 py-3 rounded-xl shadow-2xl text-[12px] font-medium max-w-xs">{toast}</div>
        </div>
      )}
    </div>
  );
}
