type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, number[]>();

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const bucket = (buckets.get(config.key) || []).filter(timestamp => timestamp > windowStart);

  if (bucket.length >= config.limit) {
    const retryAfterMs = Math.max(config.windowMs - (now - bucket[0]), 1000);
    buckets.set(config.key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  bucket.push(now);
  buckets.set(config.key, bucket);

  return {
    allowed: true,
    remaining: Math.max(config.limit - bucket.length, 0),
    retryAfterSeconds: 0,
  };
}
