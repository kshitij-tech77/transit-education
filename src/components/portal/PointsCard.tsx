import Link from "next/link";
import { Coins, Gift } from "lucide-react";

interface PointsCardProps {
  pointsBalance: number;
  lifetimeEarned: number;
  hasLifetimeData: boolean;
}

export function PointsCard({ pointsBalance, lifetimeEarned, hasLifetimeData }: PointsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-gray-800">Your Points</p>
        {hasLifetimeData && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Lifetime Earned</p>
            <p className="text-[13px] font-bold text-gray-900">{lifetimeEarned}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Available Points</p>
          <p className="text-4xl font-bold text-gray-900 leading-tight">{pointsBalance}</p>
        </div>
        <div className="w-11 h-11 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
          <Coins size={20} />
        </div>
      </div>

      <Link
        href="/portal/rewards"
        className="w-full flex items-center justify-center gap-1.5 bg-brand text-white text-[12px] font-bold py-2.5 rounded-lg hover:bg-brand-dark transition-colors"
      >
        <Gift size={14} /> View Rewards
      </Link>
    </div>
  );
}
