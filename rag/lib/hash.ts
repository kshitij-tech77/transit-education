import { createHash, createHmac } from 'node:crypto';

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Salted, keyed hash for abuse analytics. Never store the raw IP. */
export function hashIp(ip: string): string {
  const salt = process.env.ASK_TRANSIT_IP_SALT || 'ask-transit';
  return createHmac('sha256', salt).update(ip).digest('hex').slice(0, 32);
}

/** Rough token estimate (chars / 4). Good enough for chunk sizing. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
