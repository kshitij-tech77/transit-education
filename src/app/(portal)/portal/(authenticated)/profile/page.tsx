"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Calendar, Crown, Medal, KeyRound, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { computeTierProgress, TIER_NAMES } from "@/lib/loyalty-tiers";
import { usePortalUser, usePortalSignOut } from "../layout";
import { TierCard } from "@/components/portal/TierCard";
import { PointsCard } from "@/components/portal/PointsCard";

interface Member {
  referral_code: string;
  points_balance: number;
  lifetime_points_earned: number;
  created_at: string;
}

export default function ProfilePage() {
  const { id: userId, email } = usePortalUser();
  const signOut = usePortalSignOut();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let { data: memberRow, error } = await supabase
      .from("loyalty_members")
      .select("referral_code, points_balance, lifetime_points_earned, created_at")
      .eq("id", userId)
      .maybeSingle();

    // Same PostgREST-errors-on-unknown-column risk covered since Phase 3.
    if (error) {
      const fallback = await supabase
        .from("loyalty_members")
        .select("referral_code, points_balance, created_at")
        .eq("id", userId)
        .maybeSingle();
      memberRow = fallback.data ? { ...fallback.data, lifetime_points_earned: 0 } : null;
    }

    setMember(memberRow ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

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
  const TierIcon = tier === "GOLD" || tier === "PLATINUM" ? Crown : Medal;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your account details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-sm font-semibold text-gray-900">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
                <p className="text-sm font-semibold text-gray-900">
                  {member?.created_at
                    ? new Date(member.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                <TierIcon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Tier</p>
                <p className="text-sm font-semibold text-gray-900">{TIER_NAMES[tier]}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                <KeyRound size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Referral Code</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{member?.referral_code ?? "—"}</p>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-[12.5px] font-bold text-red-600 border border-red-200 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <TierCard tier={tier} nextTier={nextTier} pointsToNext={pointsToNext} percentToNext={percentToNext} />
          <PointsCard
            pointsBalance={member?.points_balance ?? 0}
            lifetimeEarned={member?.lifetime_points_earned ?? 0}
            hasLifetimeData={hasLifetimeData}
          />
        </div>
      </div>
    </div>
  );
}
