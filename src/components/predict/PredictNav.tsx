'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    href: '/predict',
    label: 'Predict',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
        {!active && <circle cx="12" cy="12" r="10" />}
      </svg>
    ),
  },
  {
    href: '/predict/matches',
    label: 'Matches',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
        {active
          ? <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 2c1.28 0 2.47.31 3.53.84L4.84 15.53A7.965 7.965 0 014 12c0-4.42 3.58-8 8-8zm0 16c-1.28 0-2.47-.31-3.53-.84l10.69-10.69A7.965 7.965 0 0120 12c0 4.42-3.58 8-8 8z" />
          : <circle cx="12" cy="12" r="10" />
        }
      </svg>
    ),
  },
  {
    href: '/predict/leaderboard',
    label: 'Leaders',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path d={active
          ? "M5 9h3v11H5zM16 6h3v14h-3zM11 3h2v17h-2z"
          : "M5 9h3v11H5V9zm6-6h2v17h-2V3zm6 3h2v14h-2V6z"
        } />
      </svg>
    ),
  },
  {
    href: '/predict/prizes',
    label: 'Prizes',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path d={active
          ? "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"
          : "M19 5h-2V3H7v2H5C3.9 7 3 7.9 3 9v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 16.9V19H9v2h6v-2h-2v-3.1a5.01 5.01 0 003.61-2.96C19.08 13.63 21 11.55 21 10V9c0-1.1-.9-2-2-2z"
        } />
      </svg>
    ),
  },
] as const;

export default function PredictNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/predict') return pathname === '/predict';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-lg border-t border-[#1f2937] md:hidden safe-area-inset-bottom">
        <div className="flex">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors min-h-[56px] ${
                  active ? 'text-[#2563eb]' : 'text-[#6b7280]'
                }`}
              >
                {item.icon(active)}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop top nav tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-[#111827] border border-[#1f2937] rounded-xl p-1">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#2563eb] text-white'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#1f2937]'
              }`}
            >
              {item.icon(active)}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
