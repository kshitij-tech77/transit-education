"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PortalIndex() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      router.replace(user ? "/portal/dashboard" : "/portal/login");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <Loader2 className="animate-spin text-brand" size={40} />
    </div>
  );
}
