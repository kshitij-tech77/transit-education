/** Shared types for the Ask Transit RAG engine. No framework imports here. */

export const SOURCE_TYPES = ['country', 'faq', 'blog', 'resource', 'guide', 'testimonial'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const TOPICS = [
  'cost', 'visa', 'ielts', 'scholarship', 'intake', 'university', 'general', 'experience',
] as const;
export type Topic = (typeof TOPICS)[number];

/** A chunk as produced by ingestion, before it is embedded and stored. */
export interface KbChunkInput {
  sourceType: SourceType;
  /** Stable identity, e.g. `faq:<uuid>`, `blog:<slug>#2`, `country:germany:why`. */
  sourceKey: string;
  sourceRowId?: string;
  title: string;
  section?: string;
  url?: string;
  /** `countries.id` slug, or undefined for general content. */
  country?: string;
  topic: Topic;
  content: string;
  tokenCount: number;
  lastUpdated?: string | null;
}

/** A chunk as returned by `match_kb_chunks`. */
export interface RetrievedChunk {
  id: string;
  sourceType: SourceType;
  sourceKey: string;
  title: string;
  section: string | null;
  url: string | null;
  country: string | null;
  topic: string | null;
  content: string;
  lastUpdated: string | null;
  vecSim: number | null;
  vecRank: number | null;
  ftsRank: number | null;
  rrf: number;
}

/** What the student sees for a `[n]` marker. Built by the app, never by the model. */
export interface Citation {
  n: number;
  title: string;
  section: string | null;
  url: string | null;
  sourceType: SourceType;
  lastUpdated: string | null;
}

export type StudyLevel = 'bachelor' | 'master' | 'diploma';

/** Country slugs that exist as `countries.id` / `/study-abroad/<slug>`. */
export const COUNTRY_SLUGS = [
  'canada', 'australia', 'uk', 'usa', 'germany', 'new-zealand', 'ireland', 'italy', 'south-korea',
] as const;
export type CountrySlug = (typeof COUNTRY_SLUGS)[number];
