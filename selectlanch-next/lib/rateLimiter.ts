/**
 * Rate limiter to prevent excessive Firestore requests
 * Helps stay within Firebase free tier limits
 */

interface RateLimitEntry {
  timestamps: number[];
  lastCleanup: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry>;
  private maxRequestsPerMinute: number;
  private cleanupInterval: number;

  constructor(maxRequestsPerMinute: number = 60) {
    this.requests = new Map();
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.cleanupInterval = 60 * 1000; // 1 minute

    // Auto cleanup old entries every minute
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), this.cleanupInterval);
    }
  }

  /**
   * Check if a request is allowed for the given identifier
   * @param identifier - User ID or IP address
   * @returns true if request is allowed, false if rate limit exceeded
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry) {
      // First request for this identifier
      this.requests.set(identifier, {
        timestamps: [now],
        lastCleanup: now,
      });
      return true;
    }

    // Remove timestamps older than 1 minute
    const oneMinuteAgo = now - 60 * 1000;
    entry.timestamps = entry.timestamps.filter((ts) => ts > oneMinuteAgo);

    // Check if limit exceeded
    if (entry.timestamps.length >= this.maxRequestsPerMinute) {
      return false;
    }

    // Add current timestamp
    entry.timestamps.push(now);
    entry.lastCleanup = now;

    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const entry = this.requests.get(identifier);

    if (!entry) {
      return this.maxRequestsPerMinute;
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const recentRequests = entry.timestamps.filter((ts) => ts > oneMinuteAgo);

    return Math.max(0, this.maxRequestsPerMinute - recentRequests.length);
  }

  /**
   * Get time until next request is allowed (in milliseconds)
   */
  getTimeUntilReset(identifier: string): number {
    const entry = this.requests.get(identifier);

    if (!entry || entry.timestamps.length < this.maxRequestsPerMinute) {
      return 0;
    }

    const now = Date.now();
    const oldestTimestamp = entry.timestamps[0];
    const resetTime = oldestTimestamp + 60 * 1000;

    return Math.max(0, resetTime - now);
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Clean up old entries (older than 5 minutes)
   */
  private cleanup(): void {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    const keysToDelete: string[] = [];

    this.requests.forEach((entry, key) => {
      if (entry.lastCleanup < fiveMinutesAgo) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.requests.delete(key));
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalIdentifiers: number;
    identifiers: string[];
  } {
    return {
      totalIdentifiers: this.requests.size,
      identifiers: Array.from(this.requests.keys()),
    };
  }
}

// Singleton instances for different rate limits
export const generalRateLimiter = new RateLimiter(60); // 60 requests per minute
export const searchRateLimiter = new RateLimiter(30); // 30 searches per minute
export const writeRateLimiter = new RateLimiter(20); // 20 writes per minute

/**
 * Helper function to execute with rate limiting
 */
export async function withRateLimit<T>(
  identifier: string,
  fn: () => Promise<T>,
  limiter: RateLimiter = generalRateLimiter,
  errorMessage: string = 'Rate limit exceeded. Please try again later.'
): Promise<T> {
  if (!limiter.isAllowed(identifier)) {
    const timeUntilReset = limiter.getTimeUntilReset(identifier);
    const seconds = Math.ceil(timeUntilReset / 1000);

    throw new Error(
      `${errorMessage} Please wait ${seconds} second${seconds !== 1 ? 's' : ''}.`
    );
  }

  return fn();
}

/**
 * Get rate limit info for display
 */
export function getRateLimitInfo(
  identifier: string,
  limiter: RateLimiter = generalRateLimiter
): {
  remaining: number;
  limit: number;
  resetInSeconds: number;
} {
  return {
    remaining: limiter.getRemaining(identifier),
    limit: limiter['maxRequestsPerMinute'],
    resetInSeconds: Math.ceil(limiter.getTimeUntilReset(identifier) / 1000),
  };
}
