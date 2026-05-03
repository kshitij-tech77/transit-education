import { cn } from "@/lib/utils";

export default function SectionLabel({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("text-[#A93226] font-[700] text-[11px] tracking-[0.15em] uppercase mb-4 px-3 py-1 bg-[#FEF2F1] border border-[#F5C4BF] rounded-full inline-block", className)}>
      {children}
    </div>
  );
}
