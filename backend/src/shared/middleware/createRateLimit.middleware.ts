import { Request, Response, NextFunction } from "express";
import { PREFIX_CONFIG } from "src/config/config";
import { incrementCache, expireCache } from "src/lib/redis";
import { appLogger } from "src/utils/logger";

interface RateLimitConfig {
  WINDOW_MS: number;
  MAX_REQUESTS: number;
  KEY_PREFIX: string;
}
/**
 * Rate limiting middleware using Redis counters
 * Increments a per-IP counter and blocks when limit exceeded
 */
export const createRateLimitMiddleware = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || "unknown";
      const key = `${PREFIX_CONFIG.RATE_LIMIT_PREFIX}${config.KEY_PREFIX}:${ip}`;

      const requests = await incrementCache(key);

      if (requests === 1) {
        await expireCache(key, Math.floor(config.WINDOW_MS / 1000));
      }

      if (requests > config.MAX_REQUESTS) {
        appLogger.warn(
          { ip, requests, limit: config.MAX_REQUESTS },
          "Rate limit exceeded"
        );
        return res
          .status(429)
          .json({ success: false, message: "Too many requests" });
      }

      next();
    } catch (error) {
      appLogger.error(
        { error: error instanceof Error ? error.message : error },
        "Error in rate limit middleware"
      );
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };
};
