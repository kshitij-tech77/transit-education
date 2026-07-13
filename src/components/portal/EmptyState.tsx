import Link from "next/link";
import type { ComponentType } from "react";

interface EmptyStateCta {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  cta?: EmptyStateCta;
}

// Shared across every empty-state usage in the portal (journey, rewards,
// activity) so the "icon + title + subtitle + optional CTA" shape stays
// identical everywhere rather than drifting per component.
export function EmptyState({ icon: Icon, title, subtitle, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <Icon size={48} className="text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium">{title}</p>
      <p className="text-gray-400 text-sm mt-1 max-w-xs">{subtitle}</p>
      {cta && (
        cta.href ? (
          <Link
            href={cta.href}
            className="mt-4 text-[12px] font-bold text-brand border border-brand px-4 py-2 rounded-lg hover:bg-brand hover:text-white transition-colors"
          >
            {cta.label}
          </Link>
        ) : (
          <button
            onClick={cta.onClick}
            className="mt-4 text-[12px] font-bold text-brand border border-brand px-4 py-2 rounded-lg hover:bg-brand hover:text-white transition-colors"
          >
            {cta.label}
          </button>
        )
      )}
    </div>
  );
}
