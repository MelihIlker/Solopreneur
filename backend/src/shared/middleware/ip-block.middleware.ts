import { Request, Response, NextFunction } from "express";
import { PREFIX_CONFIG } from "@config/config";
import { getCache } from "@lib/redis";
import { appLogger } from "@utils/logger";

/**
 * IP blocklist middleware
 * Checks if the requesting IP address is blocked
 * Returns 403 Forbidden if IP is blocked
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const ipBlocklistMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ipAddress = req.ip || "unknown";
    const blockKey = `${PREFIX_CONFIG.BLOCKED_IP_PREFIX}${ipAddress}`;

    const isBlocked = await getCache(blockKey);

    if (isBlocked) {
      appLogger.warn({ ip: ipAddress }, "Blocked IP attempted access");
      return res.status(403).json({
        success: false,
        message: "Access forbidden",
      });
    }

    next();
  } catch (error) {
    appLogger.error(
      {
        error: error instanceof Error ? error.message : error,
      },
      "Error in IP blocklist middleware"
    );
    next();
  }
};
