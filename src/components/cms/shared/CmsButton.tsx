import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CmsButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

// All hex values from Portal.tsx Button replaced with design-system tokens.
// `bg-brand`         = var(--brand)         = #A93226
// `bg-brand-dark`    = var(--brand-dark)    = #7E2219
// `bg-brand-surface` = var(--brand-surface) = #FEF2F1  (added in Phase 2)
// `border-gray-200`  = var(--gray-200)      = #E5E4E0
// `text-gray-600`    = var(--gray-600)      = #6B6966
const VARIANT_STYLES: Record<CmsButtonVariant, string> = {
  primary:     "bg-brand text-white hover:bg-brand-dark",
  secondary:   "bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand",
  ghost:       "text-brand hover:bg-brand-surface",
  destructive: "text-gray-400 hover:text-red-600 hover:bg-red-50",
};

const SIZE_STYLES: Record<CmsButtonVariant, string> = {
  primary:     "text-xs px-[18px] py-[9px]",
  secondary:   "text-xs px-[18px] py-[9px]",
  ghost:       "text-[11px] px-3 py-1.5",
  destructive: "text-[11px] px-3 py-1.5",
};

interface CmsButtonProps {
  variant?: CmsButtonVariant;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function CmsButton({
  variant = "primary",
  children,
  onClick,
  className,
  loading = false,
  disabled = false,
  type = "button",
}: CmsButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "rounded-lg transition-all duration-200 font-semibold",
        "flex items-center justify-center gap-2",
        VARIANT_STYLES[variant],
        SIZE_STYLES[variant],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : children}
    </button>
  );
}
