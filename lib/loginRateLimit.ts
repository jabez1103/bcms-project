type AttemptBucket = {
  attempts: number[];
  lockUntil: number;
};

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 8;
const LOCK_MS = 15 * 60 * 1000; // 15 minutes

const buckets = new Map<string, AttemptBucket>();

function now() {
  return Date.now();
}

function getOrCreateBucket(key: string): AttemptBucket {
  const existing = buckets.get(key);
  if (existing) return existing;
  const created: AttemptBucket = { attempts: [], lockUntil: 0 };
  buckets.set(key, created);
  return created;
}

function prune(bucket: AttemptBucket, ts: number) {
  const cutoff = ts - WINDOW_MS;
  bucket.attempts = bucket.attempts.filter((entry) => entry >= cutoff);
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export function buildLoginRateLimitKey(ip: string, email: string): string {
  return `${ip.toLowerCase()}::${email.trim().toLowerCase()}`;
}

export function checkLoginRateLimit(
  key: string
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const ts = now();
  const bucket = getOrCreateBucket(key);
  prune(bucket, ts);

  if (bucket.lockUntil > ts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.lockUntil - ts) / 1000)),
    };
  }

  return { allowed: true };
}

export function registerFailedLoginAttempt(key: string): void {
  const ts = now();
  const bucket = getOrCreateBucket(key);
  prune(bucket, ts);
  bucket.attempts.push(ts);
  if (bucket.attempts.length >= MAX_ATTEMPTS) {
    bucket.lockUntil = ts + LOCK_MS;
    bucket.attempts = [];
  }
}

export function registerSuccessfulLogin(key: string): void {
  buckets.delete(key);
}
