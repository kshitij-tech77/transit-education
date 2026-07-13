"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Sparkles, LayoutDashboard, Flag, Coins, Gift, Users, Activity,
  User, Bell, ChevronDown, ArrowRight, HelpCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PortalUser {
  id: string;
  email: string | null;
}

const PortalUserContext = createContext<PortalUser | null>(null);

// Auth is checked once here, not per page — child routes read the already-
// confirmed user via this hook instead of re-checking/re-redirecting.
export function usePortalUser(): PortalUser {
  const ctx = useContext(PortalUserContext);
  if (!ctx) throw new Error("usePortalUser must be used within the portal layout");
  return ctx;
}

const NAV_ITEMS = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/milestones", label: "My Journey", icon: Flag },
  { href: "/portal/points", label: "My Points", icon: Coins },
  { href: "/portal/rewards", label: "Rewards", icon: Gift },
  { href: "/portal/referrals", label: "Referrals", icon: Users },
  { href: "/portal/activity", label: "My Activity", icon: Activity },
  { href: "/portal/profile", label: "Profile", icon: User },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/portal/login");
        return;
      }
      setUser({ id: user.id, email: user.email ?? null });
    });
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  return (
    <PortalUserContext.Provider value={user}>
      <div className="min-h-screen bg-[#FAFAF8] flex">
        <aside className="w-64 shrink-0 bg-white border-r border-[#E5E4E0] flex flex-col">
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-[15px] font-extrabold text-[#111]">Loyalty Portal</span>
            </div>
            <p className="text-[10.5px] font-semibold text-brand uppercase tracking-[0.06em] mt-1.5 ml-[2px]">Study. Earn. Achieve.</p>
          </div>

          <nav className="flex-1 px-3 space-y-0.5">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-lg text-[13px] font-semibold border-l-[3px] transition-colors ${
                    active
                      ? "border-brand text-brand bg-brand-surface"
                      : "border-transparent text-gray-500 hover:text-brand hover:bg-brand-surface/60"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <div className="bg-brand rounded-2xl p-5 text-white space-y-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <Gift size={18} />
              </div>
              <div>
                <p className="text-[13px] font-bold">Refer & Earn More!</p>
                <p className="text-[11px] opacity-80 mt-1 leading-snug">Refer your friends and earn bonus points when they complete milestones.</p>
              </div>
              <button className="w-full bg-white text-brand text-[12px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-white/90 transition-colors">
                Refer a Friend <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="px-4 pb-5 pt-3 border-t border-[#E5E4E0]">
            <button className="w-full flex items-center gap-2.5 text-left hover:text-brand transition-colors group">
              <HelpCircle size={16} className="text-gray-400 group-hover:text-brand shrink-0" />
              <span>
                <span className="block text-[12px] font-bold text-[#111] group-hover:text-brand">Need Help?</span>
                <span className="block text-[10.5px] text-gray-400">Contact our support team</span>
              </span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-[#E5E4E0] bg-white flex items-center justify-end gap-5 px-8 shrink-0">
            <button className="relative text-gray-400 hover:text-brand transition-colors" aria-label="Notifications">
              <Bell size={19} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>
            <button onClick={handleSignOut} className="flex items-center gap-2 group" title="Sign out">
              <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                <User size={15} />
              </div>
              <span className="text-[13px] font-semibold text-[#111] group-hover:text-brand transition-colors max-w-[180px] truncate">{user.email}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </PortalUserContext.Provider>
  );
}
