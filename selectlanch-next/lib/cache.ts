/**
 * Simple in-memory cache implementation with TTL (Time To Live)
 * Helps reduce Firestore read operations for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// Singleton instance
export const cache = new Cache();

/**
 * Helper function to get or fetch data with caching
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not in cache
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  cache.set(key, data, ttl);

  return data;
}

/**
 * Generate cache key for dishes queries
 */
export function getDishCacheKey(
  category?: string,
  sortBy?: string,
  limit?: number
): string {
  return `dishes:${category || 'all'}:${sortBy || 'popular'}:${limit || 50}`;
}

/**
 * Generate cache key for user liked dishes
 */
export function getUserLikedDishesCacheKey(userId: string): string {
  return `user-liked-dishes:${userId}`;
}

/**
 * Generate cache key for search results
 */
export function getSearchCacheKey(searchTerm: string, maxResults: number): string {
  return `search:${searchTerm.toLowerCase()}:${maxResults}`;
}

/**
 * Invalidate cache entries related to dishes
 */
export function invalidateDishCache(): void {
  const stats = cache.getStats();
  const dishKeys = stats.keys.filter(
    (key) => key.startsWith('dishes:') || key.startsWith('search:')
  );
  dishKeys.forEach((key) => cache.delete(key));
}

/**
 * Invalidate cache entries for a specific user
 */
export function invalidateUserCache(userId: string): void {
  const stats = cache.getStats();
  const userKeys = stats.keys.filter((key) => key.includes(userId));
  userKeys.forEach((key) => cache.delete(key));
}

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}
