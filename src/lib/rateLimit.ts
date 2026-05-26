// Simple in-memory rate limiter — suitable for single-process Node.js on shared hosting.
// Resets on process restart; good enough to stop casual abuse.

type Entry = { count: number; reset: number };
const store = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now > entry.reset) {
    entry = { count: 0, reset: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;

  // Clean up old keys periodically (every 500 new entries)
  if (store.size > 500) {
    for (const [k, v] of store) {
      if (now > v.reset) store.delete(k);
    }
  }

  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}
