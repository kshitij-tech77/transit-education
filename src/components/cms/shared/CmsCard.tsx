import { cn } from "@/lib/utils";

interface CmsCardProps {
  children: React.ReactNode;
  /** Remove default padding — use when the card contains a full-bleed table. */
  noPadding?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CmsCard({
  children,
  noPadding = false,
  className,
  onClick,
}: CmsCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-gray-200 rounded-xl",
        !noPadding && "p-5",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}
