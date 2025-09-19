// Caching utilities for API responses and static content
// Supports both in-memory and Redis caching

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Whether to compress the data
  serialize?: boolean; // Whether to serialize/deserialize data
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  compressed?: boolean;
}

// In-memory cache implementation
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private timers = new Map<string, NodeJS.Timeout>();

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = 3600, tags = [], compress = false } = options;
    
    // Clear existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set cache entry
    this.cache.set(key, {
      data: compress ? this.compress(data) : data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      tags,
      compressed: compress
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);
    
    this.timers.set(key, timer);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    // Decompress if needed
    return entry.compressed ? this.decompress(entry.data) : entry.data;
  }

  delete(key: string): boolean {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    
    return this.cache.delete(key);
  }

  clear(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // Clear cache
    this.cache.clear();
  }

  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  private compress(data: any): any {
    // Simple compression - in production, use a proper compression library
    return JSON.stringify(data);
  }

  private decompress(data: any): any {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
}

// Redis cache implementation (for production)
class RedisCache {
  private redis: any;
  private connected = false;

  constructor(redisUrl?: string) {
    if (typeof window === 'undefined' && redisUrl) {
      // Only import Redis on server side
      try {
        const Redis = require('ioredis');
        this.redis = new Redis(redisUrl);
        this.connected = true;
      } catch (error) {
        console.warn('Redis not available, falling back to memory cache');
      }
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    if (!this.connected) return;

    const { ttl = 3600, tags = [], compress = false } = options;
    
    const entry: CacheEntry<T> = {
      data: compress ? this.compress(data) : data,
      timestamp: Date.now(),
      ttl: ttl * 1000,
      tags,
      compressed: compress
    };

    try {
      await this.redis.setex(key, ttl, JSON.stringify(entry));
      
      // Store tags for invalidation
      if (tags.length > 0) {
        for (const tag of tags) {
          await this.redis.sadd(`tag:${tag}`, key);
          await this.redis.expire(`tag:${tag}`, ttl);
        }
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;

    try {
      const result = await this.redis.get(key);
      if (!result) return null;

      const entry: CacheEntry<T> = JSON.parse(result);
      
      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.delete(key);
        return null;
      }

      return entry.compressed ? this.decompress(entry.data) : entry.data;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.connected) return false;

    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    if (!this.connected) return 0;

    let invalidated = 0;

    try {
      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          await this.redis.del(`tag:${tag}`);
          invalidated += keys.length;
        }
      }
    } catch (error) {
      console.error('Redis invalidateByTags error:', error);
    }

    return invalidated;
  }

  private compress(data: any): any {
    // In production, use a proper compression library like pako
    return JSON.stringify(data);
  }

  private decompress(data: any): any {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
}

// Cache manager that handles both memory and Redis
class CacheManager {
  private memoryCache: MemoryCache;
  private redisCache: RedisCache;
  private useRedis: boolean;

  constructor(redisUrl?: string) {
    this.memoryCache = new MemoryCache();
    this.redisCache = new RedisCache(redisUrl);
    this.useRedis = !!redisUrl && typeof window === 'undefined';
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    // Always set in memory cache
    this.memoryCache.set(key, data, options);
    
    // Also set in Redis if available
    if (this.useRedis) {
      await this.redisCache.set(key, data, options);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    let data = this.memoryCache.get<T>(key);
    
    if (data !== null) {
      return data;
    }

    // Try Redis cache if available
    if (this.useRedis) {
      data = await this.redisCache.get<T>(key);
      if (data !== null) {
        // Populate memory cache with Redis data
        this.memoryCache.set(key, data);
        return data;
      }
    }

    return null;
  }

  async delete(key: string): Promise<boolean> {
    const memoryResult = this.memoryCache.delete(key);
    let redisResult = true;
    
    if (this.useRedis) {
      redisResult = await this.redisCache.delete(key);
    }
    
    return memoryResult || redisResult;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.useRedis) {
      await this.redisCache.clear();
    }
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    const memoryInvalidated = this.memoryCache.invalidateByTags(tags);
    let redisInvalidated = 0;
    
    if (this.useRedis) {
      redisInvalidated = await this.redisCache.invalidateByTags(tags);
    }
    
    return memoryInvalidated + redisInvalidated;
  }

  getStats() {
    return {
      memory: {
        size: this.memoryCache.size(),
        keys: this.memoryCache.keys()
      },
      redis: {
        enabled: this.useRedis
      }
    };
  }
}

// Cache decorator for functions
export function cached(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cacheKey = `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const key = `${cacheKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cache.set(key, result, options);
      
      return result;
    };

    return descriptor;
  };
}

// Enhanced cache utilities with intelligent features
export const cacheUtils = {
  // Generate cache key from URL and params
  generateKey: (url: string, params?: Record<string, any>): string => {
    const paramString = params ? JSON.stringify(params) : '';
    return `api:${url}:${paramString}`;
  },

  // Cache API responses with intelligent TTL
  cacheApiResponse: async <T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> => {
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await cache.set(key, data, options);
    return data;
  },

  // Cache with automatic key generation
  cacheWithKey: async <T>(
    url: string,
    fetcher: () => Promise<T>,
    params?: Record<string, any>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const key = cacheUtils.generateKey(url, params);
    return cacheUtils.cacheApiResponse(key, fetcher, options);
  },

  // Intelligent cache with adaptive TTL
  adaptiveCache: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    baseTtl: number = 300,
    options: CacheOptions = {}
  ): Promise<T> => {
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetcher();
      
      // Adaptive TTL based on data size and type
      let adaptiveTtl = baseTtl;
      if (Array.isArray(data)) {
        adaptiveTtl = Math.min(baseTtl * 2, 3600); // Longer TTL for lists
      } else if (typeof data === 'object' && data !== null) {
        const size = JSON.stringify(data).length;
        if (size > 10000) {
          adaptiveTtl = Math.min(baseTtl * 1.5, 1800); // Longer TTL for large objects
        }
      }

      await cache.set(key, data, { ...options, ttl: adaptiveTtl });
      return data;
    } catch (error) {
      // Cache error for shorter time to allow retry
      await cache.set(key, null, { ...options, ttl: 60 });
      throw error;
    }
  },

  // Cache with background refresh
  backgroundRefresh: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const cached = await cache.get<T>(key);
    
    if (cached !== null) {
      // Check if cache is near expiration (within 20% of TTL)
      const entry = (cache as any).memoryCache.cache.get(key);
      if (entry) {
        const age = Date.now() - entry.timestamp;
        const ttl = entry.ttl;
        if (age > ttl * 0.8) {
          // Background refresh
          fetcher().then(data => {
            cache.set(key, data, options);
          }).catch(() => {
            // Ignore background refresh errors
          });
        }
      }
      return cached;
    }

    const data = await fetcher();
    await cache.set(key, data, options);
    return data;
  },

  // Cache with stale-while-revalidate pattern
  staleWhileRevalidate: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const cached = await cache.get<T>(key);
    
    if (cached !== null) {
      // Return stale data immediately
      // Refresh in background
      fetcher().then(data => {
        cache.set(key, data, options);
      }).catch(() => {
        // Ignore background refresh errors
      });
      return cached;
    }

    // No cached data, fetch fresh
    const data = await fetcher();
    await cache.set(key, data, options);
    return data;
  },

  // Cache with circuit breaker pattern
  circuitBreaker: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const errorKey = `${key}:error`;
    const errorCount = await cache.get<number>(errorKey) || 0;
    
    if (errorCount >= 3) {
      // Circuit breaker open, return cached data or throw
      const cached = await cache.get<T>(key);
      if (cached !== null) {
        return cached;
      }
      throw new Error('Service temporarily unavailable');
    }

    try {
      const data = await fetcher();
      await cache.set(key, data, options);
      // Reset error count on success
      await cache.delete(errorKey);
      return data;
    } catch (error) {
      // Increment error count
      await cache.set(errorKey, errorCount + 1, { ttl: 300 });
      throw error;
    }
  },

  // Cache with compression for large data
  compressedCache: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    const dataSize = JSON.stringify(data).length;
    
    // Use compression for data larger than 1KB
    const useCompression = dataSize > 1024;
    
    await cache.set(key, data, { 
      ...options, 
      compress: useCompression 
    });
    return data;
  },

  // Cache with tags for bulk invalidation
  taggedCache: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    tags: string[],
    options: CacheOptions = {}
  ): Promise<T> => {
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await cache.set(key, data, { 
      ...options, 
      tags: [...(options.tags || []), ...tags] 
    });
    return data;
  },

  // Cache with hit rate tracking
  hitRateCache: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const statsKey = `${key}:stats`;
    const stats = await cache.get<{ hits: number; misses: number }>(statsKey) || { hits: 0, misses: 0 };
    
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      stats.hits++;
      await cache.set(statsKey, stats, { ttl: 86400 }); // Keep stats for 24 hours
      return cached;
    }

    stats.misses++;
    await cache.set(statsKey, stats, { ttl: 86400 });
    
    const data = await fetcher();
    await cache.set(key, data, options);
    return data;
  }
};

// Create cache instance
const cache = new CacheManager(process.env.REDIS_URL);

// Export cache instance and utilities
export { cache, CacheManager, MemoryCache, RedisCache };
export default cache;

