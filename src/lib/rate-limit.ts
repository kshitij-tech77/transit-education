import { createClient } from '@supabase/supabase-js'

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000

export async function checkLoginLocked(key: string): Promise<{ locked: boolean; retryAfter: number }> {
  const { data } = await supabase
    .from('login_attempts')
    .select('count, locked_until')
    .eq('key', key)
    .single()

  if (!data) return { locked: false, retryAfter: 0 }

  if (data.locked_until) {
    const lockedUntil = new Date(data.locked_until).getTime()
    const now = Date.now()
    if (now < lockedUntil) {
      return { locked: true, retryAfter: Math.ceil((lockedUntil - now) / 1000) }
    }
  }

  return { locked: false, retryAfter: 0 }
}

export async function recordLoginFailure(key: string): Promise<number> {
  const { data } = await supabase
    .from('login_attempts')
    .select('count')
    .eq('key', key)
    .single()

  const newCount = (data?.count ?? 0) + 1
  const lockedUntil = newCount >= LIMIT
    ? new Date(Date.now() + WINDOW_MS).toISOString()
    : null

  await supabase
    .from('login_attempts')
    .upsert({ key, count: newCount, locked_until: lockedUntil })

  return newCount
}

export async function clearLoginFailures(key: string): Promise<void> {
  await supabase.from('login_attempts').delete().eq('key', key)
}
