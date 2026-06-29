/**
 * Single source of truth for all public-facing statistics.
 * Update values here — every component reads from this file.
 */
export const STATS = {
  studentsHelped: 2000,
  yearsExperience: 10,
  universityPartners: 100,
  countriesCovered: 15,
  branches: 4,
} as const;

export type Stats = typeof STATS;
