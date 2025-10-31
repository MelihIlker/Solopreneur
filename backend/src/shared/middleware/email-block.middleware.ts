import { Request, Response, NextFunction } from "express";
import { PREFIX_CONFIG } from "src/config/config";
import { deleteCache, getCache, setCache } from "src/lib/redis";
import { appLogger } from "src/utils/logger";

/**
 * Email blocklist middleware
 * Checks if the email address is blocked from authentication
 * Returns 403 Forbidden if email is blocked
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const emailBlocklistMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next();
    }

    const normalizedEmail = email.toLowerCase().trim();
    const blockKey = `${PREFIX_CONFIG.BLOCKED_EMAIL_PREFIX}${normalizedEmail}`;

    const isBlocked = await getCache(blockKey);

    if (isBlocked) {
      appLogger.warn(
        { email: normalizedEmail },
        "Blocked email attempted access"
      );
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
      "Error in email blocklist middleware"
    );
    next();
  }
};

/**
 * Blocks an email address for a specified duration
 * @param {string} email - Email address to block
 * @param {number} [durationInSeconds=86400] - Block duration in seconds (default: 24 hours)
 * @returns {Promise<boolean>} True if email was blocked successfully
 * @example
 * await blockEmail('spam@example.com', 86400); // Block for 24 hours
 * await blockEmail('abuser@example.com'); // Block with default duration
 */
export const blockEmail = async (
  email: string,
  durationInSeconds: number = 86400
): Promise<boolean> => {
  const normalizedEmail = email.toLowerCase().trim();
  const blockKey = `${PREFIX_CONFIG.BLOCKED_EMAIL_PREFIX}${normalizedEmail}`;

  const success = await setCache(blockKey, "1", durationInSeconds);

  if (success) {
    appLogger.info(
      { email: normalizedEmail, duration: durationInSeconds },
      "Email blocked successfully"
    );
  }

  return success;
};

/**
 * Unblocks an email address
 * @param {string} email - Email address to unblock
 * @returns {Promise<boolean>} True if email was unblocked successfully
 * @example
 * await unblockEmail('user@example.com');
 */
export const unblockEmail = async (email: string): Promise<boolean> => {
  const normalizedEmail = email.toLowerCase().trim();
  const blockKey = `${PREFIX_CONFIG.BLOCKED_EMAIL_PREFIX}${normalizedEmail}`;

  const success = await deleteCache(blockKey);

  if (success) {
    appLogger.info({ email: normalizedEmail }, "Email unblocked successfully");
  }

  return success;
};

/**
 * Checks if an email is blocked
 * @param {string} email - Email address to check
 * @returns {Promise<boolean>} True if email is blocked
 * @example
 * const blocked = await isEmailBlocked('user@example.com');
 */
export const isEmailBlocked = async (email: string): Promise<boolean> => {
  const normalizedEmail = email.toLowerCase().trim();
  const blockKey = `${PREFIX_CONFIG.BLOCKED_EMAIL_PREFIX}${normalizedEmail}`;

  const isBlocked = await getCache(blockKey);
  return isBlocked !== null;
};
