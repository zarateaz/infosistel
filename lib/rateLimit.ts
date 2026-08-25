/**
 * lib/rateLimit.ts
 * In-memory rate limiter for brute-force and DDoS protection.
 * Works correctly with PM2 (stateful single process).
 * For multi-process setups, replace with Redis-based solution.
 *
 * SECURITY FIX (S-04): IP Spoofing protection.
 * The rate limiter ONLY trusts X-Real-IP, which Nginx always overwrites with
 * $remote_addr (the real connecting IP) — the client cannot forge it.
 * We deliberately DO NOT use X-Forwarded-For as a fallback because it can be
 * set by the client and would allow trivial rate limit bypass.
 *
 * SECURITY FIX (D-05): Memory exhaustion protection.
 * In a distributed attack (many different IPs), the Map could grow without
 * bound and trigger the PM2 max_memory_restart, resetting all rate limits.
 * We cap the store at MAX_STORE_SIZE entries. When the cap is reached, we
 * evict the oldest 20% of entries to make room (LRU-like eviction).
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
  /** Timestamp of last access — used for LRU eviction under memory pressure */
  lastSeen: number;
}

const store = new Map<string, RateLimitRecord>();

/**
 * [D-05] Maximum number of tracked IPs before we start evicting old entries.
 * At ~100 bytes per entry, 50,000 entries ≈ 5MB — well within safe limits.
 * A real DDoS with >50k unique IPs needs a CDN/WAF, not in-process rate limiting.
 */
const MAX_STORE_SIZE = 50_000;

/**
 * [D-05] Evict the oldest 20% of entries when the store is full.
 * Sorted by lastSeen ascending (oldest first).
 */
function evictOldestEntries(): void {
  const entries = Array.from(store.entries()).sort(
    ([, a], [, b]) => a.lastSeen - b.lastSeen
  );
  const toEvict = Math.floor(entries.length * 0.2);
  for (let i = 0; i < toEvict; i++) {
    store.delete(entries[i][0]);
  }
  console.warn(
    `[RATE_LIMIT] Store full (${MAX_STORE_SIZE} entries). Evicted ${toEvict} oldest entries.`
  );
}

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, record] of store) {
    if (record.resetAt < now && (!record.blockedUntil || record.blockedUntil < now)) {
      store.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.info(`[RATE_LIMIT] Cleaned ${cleaned} expired entries. Store size: ${store.size}`);
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Check if a request from an IP should be allowed.
 * @param key        - Rate limit key (namespaced IP, e.g. "login:192.168.1.1")
 * @param maxAttempts - Max attempts in the window
 * @param windowMs   - Time window in milliseconds
 * @param blockMs    - How long to block after max attempts (default: same as window)
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000, // 15 minutes
  blockMs?: number
): RateLimitResult {
  const now = Date.now();
  const blockDuration = blockMs ?? windowMs;
  const record = store.get(key);

  // Check if currently hard-blocked (after maxAttempts exhausted)
  if (record?.blockedUntil && record.blockedUntil > now) {
    record.lastSeen = now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000),
    };
  }

  // Window expired — reset
  if (!record || record.resetAt < now) {
    // [D-05] Check store size before adding a new entry
    if (!record && store.size >= MAX_STORE_SIZE) {
      evictOldestEntries();
    }
    store.set(key, { count: 1, resetAt: now + windowMs, lastSeen: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Within window — increment
  record.count++;
  record.lastSeen = now;

  if (record.count > maxAttempts) {
    // Hard block this IP
    record.blockedUntil = now + blockDuration;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(blockDuration / 1000),
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - record.count,
  };
}

/** Reset rate limit for a key (call after successful login) */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Get current rate limit store stats (for monitoring/health endpoints).
 * Returns the total number of tracked IPs and the count of currently blocked IPs.
 */
export function getRateLimitStats(): { total: number; blocked: number; storeSize: number } {
  const now = Date.now();
  let blocked = 0;
  for (const record of store.values()) {
    if (record.blockedUntil && record.blockedUntil > now) blocked++;
  }
  return { total: store.size, blocked, storeSize: MAX_STORE_SIZE };
}

/**
 * Extract the real client IP from a Next.js request.
 *
 * SECURITY FIX (S-04): ONLY trusts X-Real-IP header.
 *
 * Nginx sets `proxy_set_header X-Real-IP $remote_addr;` which uses the actual
 * IP of the TCP connection — the client CANNOT forge this header because Nginx
 * always overwrites it with the real remote address.
 *
 * We do NOT fall back to X-Forwarded-For because:
 * 1. It is a multi-hop header and clients can prepend arbitrary values.
 * 2. If Node.js is accessed directly (bypass nginx), a client could inject
 *    any IP they want as X-Real-IP too — but that risk is mitigated by
 *    firewalling port 3000 to localhost only (nginx → localhost:3000).
 *
 * Returns "unknown" if no IP header is present (direct connection to Node.js,
 * which should be blocked by firewall in production).
 */
export function getClientIP(request: Request): string {
  // S-04: Only trust X-Real-IP — Nginx always sets this from $remote_addr
  const xRealIP = (request as any).headers?.get?.("x-real-ip");
  if (xRealIP) {
    // Strip port if present (IPv6 addresses can have brackets)
    return xRealIP.trim().split(",")[0].trim();
  }

  // If no X-Real-IP header, the request bypassed nginx.
  // Log a warning and return "unknown" — the rate limiter will treat all
  // direct connections as the same "unknown" key (effectively blocking them).
  console.warn("[SECURITY] Request without X-Real-IP header — possible nginx bypass.");
  return "unknown";
}

/**
 * Create a namespaced rate limit key to prevent cross-endpoint collisions.
 * Without namespacing, a user who hits the login 5 times would also be
 * blocked from the repair search endpoint (they share the same IP key).
 *
 * @param namespace - e.g. "login", "order", "repairs"
 * @param ip        - client IP from getClientIP()
 */
export function rateLimitKey(namespace: string, ip: string): string {
  return `${namespace}:${ip}`;
}
