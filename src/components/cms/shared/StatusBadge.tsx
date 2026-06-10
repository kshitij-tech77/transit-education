import { cn } from "@/lib/utils";
import type { ContentStatus, StudentStatus } from "@/constants/cms";

// Accepts any known status string or a raw unknown string (API may return extras).
type BadgeStatus = ContentStatus | StudentStatus | string;

// Hex colours from Portal.tsx StatusBadge replaced with Tailwind semantic classes.
// APPROVED / LIVE / PUBLISHED  → green-100 / green-700
// IN PROGRESS / CONTACTED      → blue-100  / blue-700
// ENROLLED                     → green-100 / green-700
// PENDING                      → yellow-100 / yellow-700
// REJECTED                     → red-100   / red-700
// DRAFT / NOT_INTERESTED / *   → gray-100  / gray-500
const STATUS_STYLES: Record<string, string> = {
  APPROVED:       "bg-green-100  text-green-700",
  LIVE:           "bg-green-100  text-green-700",
  PUBLISHED:      "bg-green-100  text-green-700",
  ENROLLED:       "bg-green-100  text-green-700",
  "IN PROGRESS":  "bg-blue-100   text-blue-700",
  CONTACTED:      "bg-blue-100   text-blue-700",
  PENDING:        "bg-yellow-100 text-yellow-700",
  REJECTED:       "bg-red-100    text-red-700",
  DRAFT:          "bg-gray-100   text-gray-500",
  NOT_INTERESTED: "bg-gray-100   text-gray-500",
  NEW:            "bg-blue-100   text-blue-700",
};

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalised = status ? status.toUpperCase() : "DRAFT";
  const colourCls  = STATUS_STYLES[normalised] ?? "bg-gray-100 text-gray-500";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5",
        "text-[10px] font-bold uppercase tracking-wider",
        colourCls,
        className,
      )}
    >
      {status || "DRAFT"}
    </span>
  );
}
