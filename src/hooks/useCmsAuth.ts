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
        } else {
          // No profiles row (or the read was blocked) — the header will fall
          // back to the "USER" placeholder and the CMS API calls will 403.
          console.error(
            "[useCmsAuth] could not load profiles row for",
            authUser.id,
            "-",
            profileError?.message ?? "query returned no data"
          );
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
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // A failed global sign-out (offline, already-invalid token) must not
      // block the redirect — we still clear local state below.
      console.error("[useCmsAuth] signOut error:", err);
    }

    // Belt-and-suspenders: expire any lingering Supabase auth cookies. The
    // browser client and the server login route disagree on cookie options
    // (Secure in prod, chunked `sb-…auth-token.0/.1`), so signOut() alone
    // can leave a still-valid cookie that bounces the user back into /cms.
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        if (name.startsWith("sb-")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });
    }

    router.refresh();
    // Hard redirect (not router.push) — forces a full reload so all client
    // state is dropped and middleware re-evaluates against the cleared session.
    window.location.href = "/cms/login";
  }, [router]);

  return { user, profile, loading, handleLogout };
}
