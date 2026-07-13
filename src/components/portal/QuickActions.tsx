import Link from "next/link";
import { Flag, Users, Compass, Activity } from "lucide-react";
import type { ComponentType } from "react";

export interface QuickAction {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { href: "/portal/milestones", label: "Claim Milestone", icon: Flag },
  { href: "/portal/referrals", label: "Refer a Friend", icon: Users },
  { href: "/portal/milestones", label: "View My Journey", icon: Compass },
  { href: "/portal/activity", label: "My Activity", icon: Activity },
];

interface QuickActionsProps {
  actions?: QuickAction[];
}

export function QuickActions({ actions = DEFAULT_ACTIONS }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] shadow-sm p-4">
      <p className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map(a => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col items-start gap-2 p-3 rounded-xl border border-[#E5E4E0] hover:border-brand hover:bg-brand-surface/50 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
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
