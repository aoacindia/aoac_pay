import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getServerEnv } from "@/lib/env";

type RateLimitResult = {
  success: boolean;
  remaining: number;
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

function getUpstashLimiter(limit: number, window: `${number} s` | `${number} m`) {
  const env = getServerEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
  });
}

export async function rateLimit(
  key: string,
  options: { limit?: number; windowMs?: number } = {},
): Promise<RateLimitResult> {
  const limit = options.limit ?? 20;
  const windowMs = options.windowMs ?? 60_000;
  const identifier = key.slice(0, 256);

  const upstash = getUpstashLimiter(limit, "1 m");
  if (upstash) {
    const result = await upstash.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
    };
  }

  return memoryRateLimit(identifier, limit, windowMs);
}
