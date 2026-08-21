"use client";

/**
 * useCmsData — fetches CMS API endpoints on demand, tracking which
 * `CmsDataState` keys have been loaded so callers only ever fetch what a
 * given section actually needs (see SECTION_DATA_KEYS in constants/cms.ts).
 *
 * Returns:
 *   data        — fully-typed CmsDataState (zero `any`)
 *   loading     — true while any fetch is in flight
 *   error       — last fetch error message, or null
 *   loadedKeys  — CmsDataState keys fetched at least once this session
 *   refetch     — fetches all 20 endpoints; kept as an explicit "refresh
 *                 everything" escape hatch, not used for routine loading
 *   refetchKeys — force-refetches the given keys regardless of loadedKeys
 *   ensureLoaded — fetches only the given keys not already in loadedKeys
 */

import { useState, useCallback, useEffect, useRef } from "react";
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
  TeamMember,
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
  { key: "teamMembers",        path: "/api/cms/team-members"        },
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
    teamMembers,
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
    teamMembers:        isArray<TeamMember>(teamMembers)     ? teamMembers        : [],
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
  loadedKeys: ReadonlySet<keyof CmsDataState>;
  refetch: () => Promise<void>;
  /** Force-refetches the given keys, leaving the rest of `data` untouched. */
  refetchKeys: (keys: (keyof CmsDataState)[]) => Promise<void>;
  /** Fetches only the keys not already in `loadedKeys`; no-ops if all are loaded. */
  ensureLoaded: (keys: (keyof CmsDataState)[]) => Promise<void>;
}

export function useCmsData(): UseCmsDataReturn {
  const [data, setData] = useState<CmsDataState>(INITIAL_CMS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedKeys, setLoadedKeys] = useState<ReadonlySet<keyof CmsDataState>>(new Set());

  // Read synchronously inside callbacks without making their identity depend
  // on loadedKeys (which changes on every fetch) — keeps ensureLoaded stable
  // across renders so effects that depend on it don't re-run needlessly.
  const loadedKeysRef = useRef(loadedKeys);
  useEffect(() => {
    loadedKeysRef.current = loadedKeys;
  });

  // Explicit "refresh everything" escape hatch — not used for routine
  // section loading (see ensureLoaded/refetchKeys below), only kept for
  // callers that genuinely need every endpoint re-synced at once.
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
      setLoadedKeys(new Set(ENDPOINTS.map(e => e.key)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown fetch error";
      setError(message);
      console.error("[useCmsData] refetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Targeted refetch for mutations/section loads that only need a couple of
  // endpoints — avoids re-fetching all 20. Falls back to the previous value
  // per key on error, instead of blanking it out, so a transient failure on
  // one endpoint doesn't wipe already-loaded data. Always fetches the given
  // keys, regardless of whether they're already in loadedKeys — use
  // ensureLoaded instead when a stale-but-loaded key should be left alone.
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
      setLoadedKeys(prev => {
        const next = new Set(prev);
        targets.forEach(t => next.add(t.key));
        return next;
      });
    } catch (err) {
      console.error("[useCmsData] refetchKeys failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureLoaded = useCallback(async (keys: (keyof CmsDataState)[]) => {
    const missing = keys.filter(k => !loadedKeysRef.current.has(k));
    if (missing.length === 0) return;
    await refetchKeys(missing);
  }, [refetchKeys]);

  return { data, loading, error, loadedKeys, refetch, refetchKeys, ensureLoaded };
}
