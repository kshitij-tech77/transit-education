import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CmsButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const VARIANT_STYLES: Record<CmsButtonVariant, string> = {
  primary:     "bg-brand text-white hover:bg-brand-dark",
  secondary:   "bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand",
  ghost:       "text-brand hover:bg-brand-surface",
  destructive: "text-gray-400 hover:text-red-600 hover:bg-red-50",
};

const SIZE_STYLES: Record<CmsButtonVariant, string> = {
  primary:     "text-xs px-4.5 py-2.25",
  secondary:   "text-xs px-4.5 py-2.25",
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
