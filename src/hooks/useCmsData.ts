"use client";

/**
 * useCmsData — parallel-fetches all 14 CMS API endpoints.
 *
 * NOT yet wired into Portal.tsx. Drop-in replacement for Portal's
 * fetchData function once Phase 4 (section extraction) begins.
 *
 * Returns:
 *   data     — fully-typed CmsDataState (zero `any`)
 *   loading  — true during initial load and any refetch
 *   error    — last fetch error message, or null
 *   refetch  — stable callback; call after mutations to sync state
 */

import { useState, useCallback } from "react";
import type {
  CmsDataState,
  Student,
  CmsBlogPost,
  Faq,
  Country,
  SuccessStory,
  Resource,
  Branch,
  Testimonial,
  SiteSettings,
  MediaLibrary,
  CmsEvent,
  JobOpening,
  JobApplication,
  FranchiseInquiry,
  LoyaltyReward,
  LoyaltyRedemption,
  LoyaltyMember,
  LoyaltyMilestone,
  LoyaltyCompletion,
} from "@/types/cms";
import { INITIAL_CMS_DATA } from "@/types/cms";

// ─── Endpoint Manifest ────────────────────────────────────────────────────────
// Order must match the destructure in parseResults below.

const ENDPOINTS = [
  { key: "students",           path: "/api/cms/students"            },
  { key: "posts",              path: "/api/cms/blog"                },
  { key: "faqs",               path: "/api/cms/faqs"                },
  { key: "countries",          path: "/api/cms/countries"           },
  { key: "successStories",     path: "/api/cms/success-stories"     },
  { key: "resources",          path: "/api/cms/resources"           },
  { key: "branches",           path: "/api/cms/branches"            },
  { key: "testimonials",       path: "/api/cms/testimonials"        },
  { key: "settings",           path: "/api/cms/settings"            },
  { key: "media",              path: "/api/cms/media"               },
  { key: "events",             path: "/api/cms/events"              },
  { key: "jobOpenings",        path: "/api/cms/job-openings"        },
  { key: "jobApplications",    path: "/api/cms/job-applications"    },
  { key: "franchiseInquiries", path: "/api/cms/franchise-inquiries" },
  { key: "loyaltyRewards",     path: "/api/cms/loyalty/rewards"     },
  { key: "loyaltyRedemptions", path: "/api/cms/loyalty/redemptions" },
  { key: "loyaltyMembers",     path: "/api/cms/loyalty/members"     },
  { key: "loyaltyMilestones",  path: "/api/cms/loyalty/milestones"  },
  { key: "loyaltyCompletions", path: "/api/cms/loyalty/completions" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Maps raw JSON responses (in ENDPOINTS order) to a typed CmsDataState.
 * Mirrors Portal.tsx's setData transform but removes all `any` casts.
 */
function parseResults(results: (unknown | null)[]): CmsDataState {
  const [
    students,
    posts,
    faqs,
    countries,
    successStories,
    resources,
    branches,
    testimonials,
    settings,
    media,
    events,
    jobOpenings,
    jobApplications,
    franchiseInquiries,
    loyaltyRewards,
    loyaltyRedemptions,
    loyaltyMembers,
    loyaltyMilestones,
    loyaltyCompletions,
  ] = results;

  return {
    students:           isArray<Student>(students)           ? students           : [],
    posts:              isArray<CmsBlogPost>(posts)          ? posts              : [],
    faqs:               isArray<Faq>(faqs)                   ? faqs               : [],
    countries:          isArray<Country>(countries)          ? countries          : [],
    successStories:     isArray<SuccessStory>(successStories)? successStories     : [],
    resources:          isArray<Resource>(resources)         ? resources          : [],
    branches:           isArray<Branch>(branches)            ? branches           : [],
    testimonials:       isArray<Testimonial>(testimonials)   ? testimonials       : [],
    settings:           isObject(settings)                   ? (settings as SiteSettings) : {},
    media:              isObject(media)                      ? (media as MediaLibrary)    : {},
    events:             isArray<CmsEvent>(events)            ? events             : [],
    jobOpenings:        isArray<JobOpening>(jobOpenings)     ? jobOpenings        : [],
    jobApplications:    isArray<JobApplication>(jobApplications) ? jobApplications : [],
    franchiseInquiries: isArray<FranchiseInquiry>(franchiseInquiries) ? franchiseInquiries : [],
    loyaltyRewards:     isArray<LoyaltyReward>(loyaltyRewards)         ? loyaltyRewards     : [],
    loyaltyRedemptions: isArray<LoyaltyRedemption>(loyaltyRedemptions) ? loyaltyRedemptions : [],
    loyaltyMembers:     isArray<LoyaltyMember>(loyaltyMembers)         ? loyaltyMembers     : [],
    loyaltyMilestones:  isArray<LoyaltyMilestone>(loyaltyMilestones)   ? loyaltyMilestones  : [],
    loyaltyCompletions: isArray<LoyaltyCompletion>(loyaltyCompletions) ? loyaltyCompletions : [],
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCmsDataReturn {
  data: CmsDataState;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /** Refetches only the given keys, leaving the rest of `data` untouched. */
  refetchKeys: (keys: (keyof CmsDataState)[]) => Promise<void>;
}

export function useCmsData(): UseCmsDataReturn {
  const [data, setData] = useState<CmsDataState>(INITIAL_CMS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const responses = await Promise.all(
        ENDPOINTS.map(({ path }) => fetch(path))
      );

      const results = await Promise.all(
        responses.map(async (res, i) => {
          if (!res.ok) {
            console.error(
              `[useCmsData] ${ENDPOINTS[i].path} → ${res.status} ${res.statusText}`
            );
            return null;
          }
          return res.json() as Promise<unknown>;
        })
      );

      setData(parseResults(results));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown fetch error";
      setError(message);
      console.error("[useCmsData] refetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Targeted refetch for mutations that only affect a couple of sections
  // (e.g. a loyalty edit) — avoids re-fetching all 19 endpoints. Falls back
  // to the previous value per key on error, instead of blanking it out, so a
  // transient failure on one endpoint doesn't wipe already-loaded data.
  const refetchKeys = useCallback(async (keys: (keyof CmsDataState)[]) => {
    const targets = ENDPOINTS.filter(e => (keys as string[]).includes(e.key));
    if (targets.length === 0) return;

    setLoading(true);
    try {
      const responses = await Promise.all(targets.map(({ path }) => fetch(path)));
      const results = await Promise.all(
        responses.map(async (res, i) => {
          if (!res.ok) {
            console.error(
              `[useCmsData] ${targets[i].path} → ${res.status} ${res.statusText}`
            );
            return undefined;
          }
          return res.json() as Promise<unknown>;
        })
      );

      setData(prev => {
        const next = { ...prev };
        targets.forEach((t, i) => {
          const raw = results[i];
          if (raw === undefined) return; // keep previous value for this key
          const isObjectKey = t.key === "settings" || t.key === "media";
          const valid = isObjectKey ? isObject(raw) : isArray(raw);
          if (valid) {
            (next as Record<string, unknown>)[t.key] = raw;
          }
        });
        return next;
      });
    } catch (err) {
      console.error("[useCmsData] refetchKeys failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch, refetchKeys };
}
