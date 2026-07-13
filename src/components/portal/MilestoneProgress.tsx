import { Trophy } from "lucide-react";
import { TIER_NAMES } from "@/lib/tier-progress";
import type { LoyaltyTier } from "@/lib/loyalty-tiers";

interface MilestoneProgressProps {
  completedCount: number;
  totalCount: number;
  nextTier: LoyaltyTier | null;
}

export function MilestoneProgress({ completedCount, totalCount, nextTier }: MilestoneProgressProps) {
  const remaining = Math.max(0, totalCount - completedCount);
  const percent = totalCount > 0 ? Math.min(100, (completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-brand-surface rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <Trophy size={22} className="text-brand shrink-0" />
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-[#111]">Complete more milestones to level up!</p>
          <p className="text-[12px] text-gray-500">
            {totalCount === 0
              ? "Your milestones will appear here once set up by the team."
              : remaining > 0
              ? `You're doing great! Complete ${remaining} more milestone${remaining === 1 ? "" : "s"} to reach ${nextTier ? TIER_NAMES[nextTier] : "the next tier"}.`
              : "You've completed every milestone available right now!"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-28 h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-[12px] font-bold text-[#111] whitespace-nowrap">{completedCount}/{totalCount}</span>
        </div>
        <span className="text-[11.5px] font-bold text-brand px-4 py-2.5 rounded-lg border border-brand whitespace-nowrap">View Benefits</span>
      </div>
    </div>
  );
}
