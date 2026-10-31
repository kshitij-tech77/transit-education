import Anthropic from '@anthropic-ai/sdk';
import { requireEnv } from '../config';

let client: Anthropic | null = null;

/** Lazy Anthropic client. Reads ANTHROPIC_API_KEY on first use. */
export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: requireEnv('ANTHROPIC_API_KEY'), maxRetries: 2 });
  }
  return client;
}
