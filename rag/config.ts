/**
 * All tunables for the RAG engine, in one place.
 *
 * Environment is read at call time (never at import time) so that scripts can
 * load `.env.local` first and tests can override values.
 */

export const EMBEDDING_DIMENSIONS = 1536;

export interface RagConfig {
  models: { answer: string; understand: string; judge: string };
  embedding: { model: string; dimensions: number; batchSize: number };
  retrieval: {
    /** Chunks passed to the model per turn. */
    topK: number;
    /** Below this cosine similarity a vector-only hit is dropped as noise. */
    minSimilarity: number;
  };
  chat: {
    maxMessageChars: number;
    /** Prior messages replayed to the model (user + assistant). */
    historyMessages: number;
    maxOutputTokens: number;
    /** Kill switch for cost: total user messages accepted per UTC day. */
    dailyMessageCap: number;
  };
  lead: { qualifiedScore: number; minUserMessages: number };
}

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function getConfig(): RagConfig {
  return {
    models: {
      // Model choice is the team's (RagCounselor.md §S1). Start on Sonnet;
      // move to `claude-opus-5` if groundedness evals underperform.
      answer: process.env.ASK_TRANSIT_ANSWER_MODEL || 'claude-sonnet-5',
      understand: process.env.ASK_TRANSIT_UNDERSTAND_MODEL || 'claude-haiku-4-5',
      judge: process.env.ASK_TRANSIT_JUDGE_MODEL || 'claude-haiku-4-5',
    },
    embedding: {
      model: process.env.ASK_TRANSIT_EMBEDDING_MODEL || 'text-embedding-3-small',
      dimensions: EMBEDDING_DIMENSIONS,
      batchSize: 100,
    },
    retrieval: {
      topK: num('ASK_TRANSIT_TOP_K', 8),
      minSimilarity: num('ASK_TRANSIT_MIN_SIMILARITY', 0.2),
    },
    chat: {
      maxMessageChars: 1500,
      historyMessages: 8,
      maxOutputTokens: 900,
      dailyMessageCap: num('ASK_TRANSIT_DAILY_MESSAGE_CAP', 3000),
    },
    lead: { qualifiedScore: 50, minUserMessages: 2 },
  };
}

/** Feature flag. Anything but the literal string "true" is off. */
export function isAskTransitEnabled(): boolean {
  return process.env.ASK_TRANSIT_ENABLED === 'true';
}

/** Throws a readable error naming the missing variable. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable ${name}`);
  return v;
}
