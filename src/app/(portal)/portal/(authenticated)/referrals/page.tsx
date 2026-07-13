"use client";

import { useEffect, useState } from "react";
import { Share2, UserPlus, Gift, Loader2, Users, Coins } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { computeTierProgress } from "@/lib/loyalty-tiers";
import { REFERRAL_SIGNUP_POINTS } from "@/lib/loyalty";
import { usePortalUser } from "../layout";
import { TierCard } from "@/components/portal/TierCard";
import { PointsCard } from "@/components/portal/PointsCard";
import { QuickActions } from "@/components/portal/QuickActions";
import { ReferralCodeCard } from "@/components/portal/ReferralCodeCard";

interface Member {
  referral_code: string;
  points_balance: number;
  lifetime_points_earned: number;
}

const STEPS = [
  { icon: Share2, title: "Share your code", desc: "Send your referral code or invite link to a friend." },
  { icon: UserPlus, title: "Friend signs up", desc: "They create a portal account using your code." },
  {
    icon: Gift,
    title: "You both earn points",
    // REFERRAL_MILESTONE_BONUS isn't a fixed constant anywhere in the
    // codebase — referrer_bonus_points is an optional, admin-set value per
    // milestone (loyalty_milestones.referrer_bonus_points), so there's no
    // single number to quote for it here.
    desc: `You earn ${REFERRAL_SIGNUP_POINTS} points when they join, plus more when they complete milestones.`,
  },
];

export default function ReferralsPage() {
  const { id: userId } = usePortalUser();

  const [member, setMember] = useState<Member | null>(null);
  const [friendsReferred, setFriendsReferred] = useState<number | null>(null);
  const [totalBonusPoints, setTotalBonusPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { data: memberRow, error } = await supabase
        .from("loyalty_members")
        .select("referral_code, points_balance, lifetime_points_earned")
        .eq("id", userId)
        .maybeSingle();

      // Same PostgREST-errors-on-unknown-column risk covered since Phase 3.
      if (error) {
        const fallback = await supabase
          .from("loyalty_members")
          .select("referral_code, points_balance")
          .eq("id", userId)
          .maybeSingle();
        memberRow = fallback.data ? { ...fallback.data, lifetime_points_earned: 0 } : null;
      }
      setMember(memberRow ?? null);

      // Cleanly queryable from existing data — no new endpoint needed.
      // "Friends referred" = one REFERRAL_SIGNUP transaction per referred
      // signup credited to this member; total bonus = sum across both
      // referral-related reason codes.
      const { data: referralTxns } = await supabase
        .from("loyalty_transactions")
        .select("points, reason_code")
        .eq("member_id", userId)
        .in("reason_code", ["REFERRAL_SIGNUP", "REFERRAL_MILESTONE_BONUS"]);

      if (referralTxns) {
        setFriendsReferred(referralTxns.filter(t => t.reason_code === "REFERRAL_SIGNUP").length);
        setTotalBonusPoints(referralTxns.reduce((sum, t) => sum + t.points, 0));
      }

      setLoading(false);
    })();
  }, [userId]);

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Referrals</h1>
        <p className="text-sm text-gray-600 mt-1">Invite friends and earn bonus points when they join and complete milestones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <ReferralCodeCard referralCode={member?.referral_code ?? null} />

          {friendsReferred !== null && totalBonusPoints !== null && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-5 text-center">
                <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand mx-auto mb-2">
                  <Users size={16} />
                </div>
                <p className="text-4xl font-bold text-gray-900">{friendsReferred}</p>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">Friends Referred</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-5 text-center">
                <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand mx-auto mb-2">
                  <Coins size={16} />
                </div>
                <p className="text-4xl font-bold text-gray-900">{totalBonusPoints}</p>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">Bonus Points Earned</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-6">
            <p className="text-lg font-semibold text-gray-800 mb-4">How It Works</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="flex flex-col items-start gap-2 border-l-2 border-brand pl-3.5">
                    <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-brand">
                      <Icon size={16} />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{i + 1}. {s.title}</p>
                    <p className="text-sm text-gray-600 leading-snug">{s.desc}</p>
                  </div>
                );
              })}
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
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
