import { cn } from "@/lib/utils";

export const CMS_INPUT_CLS =
  "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none " +
  "focus:border-brand transition-colors";

export const CMS_LABEL_CLS =
  "text-[10px] font-bold text-gray-400 uppercase tracking-wide";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  /** Current character count — enables the counter badge when provided. */
  charCount?: number;
  /** Maximum allowed characters — required when charCount is set. */
  charLimit?: number;
  className?: string;
}

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
