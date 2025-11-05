import crypto from "crypto";
import { getCacheJSON, setCache, deleteCache } from "@lib/redis";
import { sessionLogger } from "@utils/logger";
import { PREFIX_CONFIG } from "@config/config";

class CSRFService {
  private readonly CSRF_PREFIX = PREFIX_CONFIG.CSRF_PREFIX;
  private readonly CSRF_TTL = 30 * 60; // 30 minutes

  /**
   * Generate a new CSRF token for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<string>} Generated CSRF token
   */
  async generateToken(sessionId: string): Promise<string> {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const key = `${this.CSRF_PREFIX}${sessionId}`;

      await setCache(key, token, this.CSRF_TTL);

      sessionLogger.info({ sessionId }, "CSRF token generated");
      return token;
    } catch (error) {
      sessionLogger.error(
        {
          sessionId,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to generate CSRF token"
      );
      throw error;
    }
  }

  /**
   * Validate a CSRF token against stored token in Redis
   * @param {string} sessionId - Session ID
   * @param {string} token - Token to validate
   * @returns {Promise<boolean>} True if token is valid
   */
  async validateToken(sessionId: string, token: string): Promise<boolean> {
    try {
      const key = `${this.CSRF_PREFIX}${sessionId}`;
      const storedToken = await getCacheJSON<string>(key);

      if (!storedToken) {
        sessionLogger.warn({ sessionId }, "CSRF token not found or expired");
        return false;
      }

      // Compare tokens (constant-time comparison for security)
      const isValid = crypto.timingSafeEqual(
        Buffer.from(storedToken),
        Buffer.from(token)
      );

      if (isValid) {
        sessionLogger.info({ sessionId }, "CSRF token validated successfully");
      } else {
        sessionLogger.warn({ sessionId }, "CSRF token validation failed");
      }

      return isValid;
    } catch (error) {
      sessionLogger.error(
        {
          sessionId,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to validate CSRF token"
      );
      return false;
    }
  }

  /**
   * Refresh (regenerate) a CSRF token
   * @param {string} sessionId - Session ID
   * @returns {Promise<string>} New CSRF token
   */
  async refreshToken(sessionId: string): Promise<string> {
    try {
      const key = `${this.CSRF_PREFIX}${sessionId}`;
      await deleteCache(key);
      const newToken = await this.generateToken(sessionId);

      sessionLogger.info({ sessionId }, "CSRF token refreshed");
      return newToken;
    } catch (error) {
      sessionLogger.error(
        {
          sessionId,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to refresh CSRF token"
      );
      throw error;
    }
  }

  /**
   * Delete a CSRF token (e.g., on logout)
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deleteToken(sessionId: string): Promise<boolean> {
    try {
      const key = `${this.CSRF_PREFIX}${sessionId}`;
      await deleteCache(key);

      sessionLogger.info({ sessionId }, "CSRF token deleted");
      return true;
    } catch (error) {
      sessionLogger.error(
        {
          sessionId,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to delete CSRF token"
      );
      return false;
    }
  }
}

export const csrfService = new CSRFService();
