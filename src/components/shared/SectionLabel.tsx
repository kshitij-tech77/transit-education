import { cn } from "@/lib/utils";

export default function SectionLabel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-brand font-semibold text-[13px] mb-4", className)}>
      <span className="block w-5 h-0.5 bg-brand rounded-full" aria-hidden="true" />
      {children}
    </div>
  );
}
