"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CmsLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Basic check for Payload CMS token or simulated token in cookies
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const hasToken = cookies.some(c => c.trim().startsWith('payload-token='));
      
      if (!hasToken && pathname !== '/cms/login') {
        router.push('/cms/login');
      } else if (hasToken && pathname === '/cms/login') {
        router.push('/cms');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (loading && pathname !== '/cms/login') {
    return (
      <div className="min-h-screen bg-[#F7F3F3] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#A93226]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3F3]">
      {children}
    </div>
  );
}
