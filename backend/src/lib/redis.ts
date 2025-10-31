import { Redis } from "@upstash/redis";
import { REDIS_CONFIG } from "src/config/config";
import { appLogger } from "src/utils/logger";

/**
 * Upstash Redis client instance
 * Configured with REST URL and token from environment variables
 */
const redis = new Redis({
  url: REDIS_CONFIG.URL,
  token: REDIS_CONFIG.TOKEN,
});

/**
 * Cache value type - can be string, number, object, or array
 */
type CacheValue = string | number | object | any[];

/**
 * Sets a value in cache with optional expiration
 * @param {string} key - Cache key
 * @param {CacheValue} value - Value to cache (will be JSON stringified if object/array)
 * @param {number} [ttl] - Time to live in seconds (optional)
 * @returns {Promise<boolean>} True if successful, false otherwise
 * @example
 * await setCache('user:123', { name: 'John' }, 3600);
 * await setCache('token:abc', 'xyz123', 900);
 */
export async function setCache(
  key: string,
  value: CacheValue,
  ttl?: number
): Promise<boolean> {
  try {
    const serializedValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    if (ttl) {
      await redis.setex(key, ttl, serializedValue);
    } else {
      await redis.set(key, serializedValue);
    }

    appLogger.info({ key, ttl }, "Cache set successfully");
    return true;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to set cache"
    );
    return false;
  }
}

/**
 * Gets a value from cache
 * @param {string} key - Cache key
 * @returns {Promise<string | null>} Cached value or null if not found
 * @example
 * const user = await getCache('user:123');
 * const token = await getCache('token:abc');
 */
export async function getCache(key: string): Promise<string | null> {
  try {
    const value = await redis.get<string>(key);

    if (value) {
      appLogger.info({ key }, "Cache hit");
      return value;
    }

    appLogger.info({ key }, "Cache miss");
    return null;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to get cache"
    );
    return null;
  }
}

/**
 * Gets a JSON object from cache and parses it
 * @param {string} key - Cache key
 * @returns {Promise<T | null>} Parsed object or null if not found
 * @example
 * const user = await getCacheJSON<User>('user:123');
 */
export async function getCacheJSON<T = any>(key: string): Promise<T | null> {
  appLogger.info({ key }, "Getting JSON cache");
  try {
    const value = await getCache(key);
    appLogger.info({ key, value }, "Raw cache value retrieved");
    if (!value) {
      appLogger.warn({ key }, "Cache value is null or undefined");
      return null;
    }

    appLogger.info({ key }, "Parsing JSON cache value");
    return value as T;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to parse JSON from cache"
    );
    return null;
  }
}

/**
 * Deletes a value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if deleted, false otherwise
 * @example
 * await deleteCache('user:123');
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const result = await redis.del(key);
    appLogger.info({ key, deleted: result }, "Cache deleted");
    return result > 0;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to delete cache"
    );
    return false;
  }
}

/**
 * Checks if a key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if exists, false otherwise
 * @example
 * const exists = await cacheExists('user:123');
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to check existence"
    );
    return false;
  }
}

/**
 * Increments a numeric value in cache
 * @param {string} key - Cache key
 * @returns {Promise<number>} New value after increment
 * @example
 * const count = await incrementCache('request_count:ip:127.0.0.1');
 */
export async function incrementCache(key: string): Promise<number> {
  try {
    const result = await redis.incr(key);
    appLogger.info({ key, newValue: result }, "Cache incremented");
    return result;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to increment cache"
    );
    return 0;
  }
}

/**
 * Decrements a numeric value in cache
 * @param {string} key - Cache key
 * @returns {Promise<number>} New value after decrement
 * @example
 * const remaining = await decrementCache('tokens_remaining:user:123');
 */
export async function decrementCache(key: string): Promise<number> {
  try {
    const result = await redis.decr(key);
    appLogger.info({ key, newValue: result }, "Cache decremented");
    return result;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to decrement cache"
    );
    return 0;
  }
}

/**
 * Sets expiration time for a key
 * @param {string} key - Cache key
 * @param {number} seconds - Expiration time in seconds
 * @returns {Promise<boolean>} True if successful, false otherwise
 * @example
 * await expireCache('session:abc', 3600); // Expire in 1 hour
 */
export async function expireCache(
  key: string,
  seconds: number
): Promise<boolean> {
  try {
    const result = await redis.expire(key, seconds);
    appLogger.info({ key, seconds }, "Cache expiration set");
    return result === 1;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to set expiration"
    );
    return false;
  }
}

/**
 * Gets remaining time to live for a key
 * @param {string} key - Cache key
 * @returns {Promise<number>} Seconds remaining (-1 if no expiration, -2 if key doesn't exist)
 * @example
 * const ttl = await getCacheTTL('session:abc');
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    const ttl = await redis.ttl(key);
    return ttl;
  } catch (error) {
    appLogger.error(
      {
        key,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to get TTL"
    );
    return -2;
  }
}

/**
 * Deletes multiple keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., 'user:*')
 * @returns {Promise<number>} Number of deleted keys
 * @example
 * await deleteCachePattern('session:*'); // Delete all sessions
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    const result = await redis.del(...keys);
    appLogger.info({ pattern, deletedCount: result }, "Pattern deleted");
    return result;
  } catch (error) {
    appLogger.error(
      {
        pattern,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to delete pattern"
    );
    return 0;
  }
}

/**
 * Flushes all keys from the database
 *! WARNING: This deletes ALL data from Redis
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function flushAllCache(): Promise<boolean> {
  try {
    await redis.flushdb();
    appLogger.warn("All cache flushed");
    return true;
  } catch (error) {
    appLogger.error(
      {
        error: error instanceof Error ? error.message : error,
      },
      "Failed to flush cache"
    );
    return false;
  }
}

/**
 * Gets the raw Redis client for advanced operations
 * @returns {Redis} Upstash Redis client instance
 */
export function getRedisClient(): Redis {
  return redis;
}

/**
 * Adds a member to a Redis set
 * @param {string} key - Set key
 * @param {string} member - Member to add
 * @returns {Promise<boolean>} True if added, false otherwise
 */
export async function saddCache(key: string, member: string): Promise<boolean> {
  try {
    const result = await redis.sadd(key, member);
    appLogger.info({ key, member }, "SADD successful");
    return result === 1;
  } catch (error) {
    appLogger.error({ key, member, error: error instanceof Error ? error.message : error }, "SADD failed");
    return false;
  }
}

/**
 * Removes a member from a Redis set
 * @param {string} key - Set key
 * @param {string} member - Member to remove
 * @returns {Promise<boolean>} True if removed, false otherwise
 */
export async function sremCache(key: string, member: string): Promise<boolean> {
  try {
    const result = await redis.srem(key, member);
    appLogger.info({ key, member }, "SREM successful");
    return result === 1;
  } catch (error) {
    appLogger.error({ key, member, error: error instanceof Error ? error.message : error }, "SREM failed");
    return false;
  }
}

/**
 * Gets all members of a Redis set
 * @param {string} key - Set key
 * @returns {Promise<string[]>} Array of members (empty if none)
 */
export async function smembersCache(key: string): Promise<string[]> {
  try {
    const result = await redis.smembers(key);
    appLogger.info({ key, count: result.length }, "SMEMBERS successful");
    return result;
  } catch (error) {
    appLogger.error({ key, error: error instanceof Error ? error.message : error }, "SMEMBERS failed");
    return [];
  }
}

/**
 * Gets the number of members in a Redis set
 * @param {string} key - Set key
 * @returns {Promise<number>} Number of members in the set
 */
export async function scardCache(key: string): Promise<number> {
  try {
    const result = await redis.scard(key);
    appLogger.info({ key, count: result }, "SCARD successful");
    return result;
  } catch (error) {
    appLogger.error({ key, error: error instanceof Error ? error.message : error }, "SCARD failed");
    return 0;
  }
}

/**
 * Atomically increments the value of a key by 1 and sets expiry if provided.
 * @param {string} key - Redis key
 * @param {number} [expireSeconds] - Optional expiry in seconds
 * @returns {Promise<number>} The new value after increment
 */
export async function incrCache(key: string, expireSeconds?: number): Promise<number> {
  const value = await redis.incr(key);
  if (expireSeconds) {
    await redis.expire(key, expireSeconds);
  }
  return value;
}
