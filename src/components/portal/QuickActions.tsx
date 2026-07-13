import Link from "next/link";
import { Flag, Users, Compass, Activity } from "lucide-react";

const ACTIONS = [
  { href: "/portal/milestones", label: "Claim Milestone", icon: Flag },
  { href: "/portal/referrals", label: "Refer a Friend", icon: Users },
  { href: "/portal/milestones", label: "View My Journey", icon: Compass },
  { href: "/portal/activity", label: "My Activity", icon: Activity },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] p-5">
      <p className="text-[12px] font-bold text-[#111] mb-3">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col items-start gap-2 p-3 rounded-xl border border-[#E5E4E0] hover:border-brand hover:bg-brand-surface/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-surface flex items-center justify-center text-brand">
                <Icon size={15} />
              </div>
              <span className="text-[11px] font-semibold text-[#111] leading-tight">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
