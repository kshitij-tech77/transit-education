import Link from "next/link";
import { Trophy } from "lucide-react";
import { TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty-tiers";

interface MotivationalBannerProps {
  nextTier: LoyaltyTier | null;
}

export function MotivationalBanner({ nextTier }: MotivationalBannerProps) {
  return (
    <div className="bg-amber-50 rounded-2xl shadow-sm p-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Trophy size={22} className="text-amber-500 shrink-0" />
        <div>
          <p className="text-lg font-semibold text-gray-800">You&apos;re doing amazing!</p>
          <p className="text-sm text-gray-600">
            {nextTier
              ? `Keep completing milestones to reach ${TIER_NAMES[nextTier]} and unlock the best rewards.`
              : "You've reached the top tier — keep earning to unlock the best rewards."}
          </p>
        </div>
      </div>
      <Link
        href="/portal/milestones"
        className="text-[11.5px] font-bold bg-brand text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors shrink-0"
      >
        View All Milestones
      </Link>
    </div>
  );
}
