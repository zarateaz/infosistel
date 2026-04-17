/**
 * lib/rateLimit.ts
 * In-memory rate limiter for brute-force protection.
 * Works correctly with PM2 (stateful process).
 * For multi-process setups, replace with Redis-based solution.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (record.resetAt < now && (!record.blockedUntil || record.blockedUntil < now)) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Check if a request from an IP should be allowed.
 * @param ip - Client IP address
 * @param maxAttempts - Max attempts in the window
 * @param windowMs - Time window in milliseconds
 * @param blockMs - How long to block after max attempts (default: same as window)
 */
export function checkRateLimit(
  ip: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000, // 15 minutes
  blockMs?: number
): RateLimitResult {
  const now = Date.now();
  const blockDuration = blockMs ?? windowMs;
  const record = store.get(ip);

  // Check if currently hard-blocked (after maxAttempts exhausted)
  if (record?.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000),
    };
  }

  // Window expired — reset
  if (!record || record.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Within window — increment
  record.count++;

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

/** Reset rate limit for an IP (call after successful login) */
export function resetRateLimit(ip: string): void {
  store.delete(ip);
}

/** Extract real client IP from Next.js request (behind nginx proxy) */
export function getClientIP(request: Request): string {
  const xForwardedFor = (request as any).headers?.get?.("x-forwarded-for");
  const xRealIP = (request as any).headers?.get?.("x-real-ip");

  if (xForwardedFor) {
    // Could be comma-separated list — take the first (real client)
    return xForwardedFor.split(",")[0].trim();
  }
  if (xRealIP) {
    return xRealIP.trim();
  }
  return "unknown";
}
