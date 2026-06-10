"use client";

/**
 * useCmsAuth — authentication state and session management for the CMS portal.
 *
 * NOT yet wired into Portal.tsx. Drop-in replacement for Portal's
 * fetchUser / handleLogout logic once Phase 4 begins.
 *
 * Uses the anon browser Supabase client (@/lib/supabase) — correct for
 * client-side auth operations per project conventions in feedback_api_conventions.md.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/cms";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseCmsAuthReturn {
  user:         User | null;
  profile:      Profile | null;
  /** True during the initial session check. Gates the portal from rendering. */
  loading:      boolean;
  handleLogout: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCmsAuth(): UseCmsAuthReturn {
  const router  = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !authUser) {
          router.push("/cms/login");
          return;
        }

        setUser(authUser);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", authUser.id)
          .single();

        if (cancelled) return;

        if (!profileError && profileData) {
          setProfile(profileData as Profile);
        }
      } catch (err) {
        console.error("[useCmsAuth] init error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/cms/login");
  }, [router]);

  return { user, profile, loading, handleLogout };
}
