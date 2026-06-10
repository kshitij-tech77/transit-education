import { cn } from "@/lib/utils";

// ─── Shared input / textarea / select className ───────────────────────────────
// Replaces the `inputCls` / `labelCls` local variables defined independently
// inside renderCountries and each modal in Portal.tsx.
// Design tokens used:
//   border-gray-200  = var(--gray-200) = #E5E4E0
//   focus:border-brand = var(--brand)  = #A93226

export const CMS_INPUT_CLS =
  "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none " +
  "focus:border-brand transition-colors";

export const CMS_LABEL_CLS =
  "text-[10px] font-bold text-gray-400 uppercase tracking-wide";

// ─── Component ────────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  /** Current character count — enables the counter badge when provided. */
  charCount?: number;
  /** Maximum allowed characters — required when charCount is set. */
  charLimit?: number;
  className?: string;
}

/**
 * Wraps any form control (input, textarea, select, custom) with a consistent
 * labelled field layout. Optionally renders a character counter for SEO fields.
 *
 * Usage:
 *   <FormField label="Meta Title" charCount={value.length} charLimit={60}>
 *     <input className={CMS_INPUT_CLS} ... />
 *   </FormField>
 */
export function FormField({
  label,
  children,
  charCount,
  charLimit,
  className,
}: FormFieldProps) {
  const showCounter = charCount !== undefined && charLimit !== undefined;
  const overLimit   = showCounter && charCount > charLimit;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className={CMS_LABEL_CLS}>{label}</label>
        {showCounter && (
          <span
            className={cn(
              "text-[10px] font-semibold tabular-nums",
              overLimit ? "text-red-500" : "text-gray-400",
            )}
          >
            {charCount}/{charLimit}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
