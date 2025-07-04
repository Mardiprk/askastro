import { createClient } from '@libsql/client';
import type { InStatement } from '@libsql/client';

// Create the base database client
const rawDb = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Simple in-memory cache for frequently accessed DB queries
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Enhanced database client with caching
export const db = {
  // Direct access to the raw client if needed
  raw: rawDb,
  
  // Cached read query for frequently accessed data
  async cachedQuery(sql: string, args: any[] = [], cacheKey: string, ttl: number = CACHE_TTL) {
    // Check if we have a valid cached result
    const now = Date.now();
    const cached = queryCache.get(cacheKey);
    
    if (cached && now - cached.timestamp < ttl) {
      return cached.result;
    }
    
    // Execute the query
    const result = await rawDb.execute({
      sql,
      args
    });
    
    // Cache the result
    queryCache.set(cacheKey, {
      result,
      timestamp: now
    });
    
    return result;
  },
  
  // Non-cached query for writes or infrequent reads
  async execute(options: InStatement) {
    return rawDb.execute(options);
  },
  
  // Invalidate a specific cache entry
  invalidateCache(cacheKey: string) {
    queryCache.delete(cacheKey);
  },
  
  // Clear the entire cache
  clearCache() {
    queryCache.clear();
  }
}; 