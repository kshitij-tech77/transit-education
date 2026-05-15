import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CmsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F3F3]">
      {children}
      <Toaster />
    </div>
  );
}
