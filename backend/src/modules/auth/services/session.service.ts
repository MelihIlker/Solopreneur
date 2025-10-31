import crypto from "crypto";
import {
  setCache,
  getCacheJSON,
  deleteCache,
  saddCache,
  sremCache,
  smembersCache,
  scardCache,
  getRedisClient,
} from "src/lib/redis";
import { sessionLogger } from "src/utils/logger";
import { PREFIX_CONFIG, SESSION_CONFIG } from "src/config/config";
import { UserProfile } from "@shared/types/UserInterface";

/**
 * Session data structure for storing user session information in Redis.
 * @typedef {Object} SessionData
 * @property {string} userId - Unique user identifier
 * @property {string} email - User's email address
 * @property {string} ip - User's IP address
 * @property {string} userAgent - User's browser user agent
 * @property {string} loginTime - ISO timestamp of login
 * @property {string} lastActivity - ISO timestamp of last activity
 */
interface SessionData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isVerified: boolean;
  isActive: boolean;
  ip: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
}

/**
 * Service for managing user sessions in Redis.
 * Handles session creation, validation, destruction, and active session tracking.
 */
class SessionService {
  private readonly SESSION_PREFIX = PREFIX_CONFIG.SESSION_PREFIX;
  private readonly SESSION_SET_PREFIX = PREFIX_CONFIG.SESSION_SET_PREFIX;
  private readonly MAX_ACTIVE_SESSIONS = SESSION_CONFIG.MAX_ACTIVE_SESSIONS;
  private readonly SESSION_TTL = SESSION_CONFIG.SESSION_TTL;

  /**
   * Creates a new session for a user and tracks the session ID in a Redis set.
   * @param {string} userId - User's unique identifier
   * @param {string} email - User's email address
   * @param {string} ip - User's IP address
   * @param {string} userAgent - User's browser user agent
   * @returns {Promise<string>} The created session ID
   * @throws {Error} If the user exceeds the maximum allowed active sessions
   */
  async createSession(
    user: UserProfile,
    ip: string,
    userAgent: string
  ): Promise<string> {
    try {
      sessionLogger.info({ userId: user.id, ip }, "Creating new session");
      const sessionSetKey = `${this.SESSION_SET_PREFIX}${user.id}`;
      const sessionCount = await scardCache(sessionSetKey);
      if (sessionCount >= this.MAX_ACTIVE_SESSIONS) {
        sessionLogger.warn({ userId: user.id, sessionCount }, "Max sessions exceeded");
        throw new Error(
          "Maximum active sessions reached. Please logout from another device."
        );
      }
      const sessionId = crypto.randomUUID();
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData: SessionData = {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl ? user.avatarUrl : undefined,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        isActive: user.isActive,
        ip,
        userAgent,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
      await setCache(sessionKey, JSON.stringify(sessionData), this.SESSION_TTL);

      const deviceKey = `${PREFIX_CONFIG.DEVICE_SESSION_PREFIX}${user.id}:${userAgent}`;
      await setCache(deviceKey, sessionId, this.SESSION_TTL);

      await saddCache(sessionSetKey, sessionId);
      sessionLogger.info(
        {
          userId: user.id,
          sessionId,
          activeSessionCount: sessionCount + 1,
        },
        "Session created successfully"
      );
      return sessionId;
    } catch (error) {
      sessionLogger.error(
        {
          userId: user.id,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to create session"
      );
      throw error;
    }
  }

  /**
   * Validates a session by session ID and updates last activity timestamp.
   * @param {string} sessionId - Session ID to validate
   * @returns {Promise<SessionData|null>} Session data if valid, otherwise null
   */
  async validateSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData = await getCacheJSON<SessionData>(sessionKey);
      if (!sessionData) {
        sessionLogger.warn({ sessionId }, "Session not found or expired");
        return null;
      }
      sessionData.lastActivity = new Date().toISOString();
      await setCache(sessionKey, JSON.stringify(sessionData), this.SESSION_TTL);
      sessionLogger.info(
        { sessionId, userId: sessionData.userId },
        "Session validated"
      );
      return sessionData;
    } catch (error) {
      sessionLogger.error(
        {
          sessionId,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to validate session"
      );
      return null;
    }
  }

  /**
   * Destroys a single session and removes its ID from the user's session set.
   * @param {string} sessionId - Session ID to destroy
   * @returns {Promise<boolean>} True if session was destroyed, false otherwise
   */
  async destroySession(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData = await getCacheJSON<SessionData>(sessionKey);
      if (sessionData) {
        await deleteCache(sessionKey);
        const sessionSetKey = `${this.SESSION_SET_PREFIX}${sessionData.userId}`;
        await sremCache(sessionSetKey, sessionId);

        const deviceKey = `${PREFIX_CONFIG.DEVICE_SESSION_PREFIX}${sessionData.userId}:${sessionData.userAgent}`;
        await deleteCache(deviceKey);
        sessionLogger.info(
          {
            sessionId,
            userId: sessionData.userId,
          },
          "Session destroyed"
        );
        return true;
      }
      return false;
    } catch (error) {
      sessionLogger.error(
        {
          sessionId,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to destroy session"
      );
      return false;
    }
  }

  /**
   * Destroys all sessions for a user using Redis pipeline for batch deletion.
   * This method deletes all session keys and the session set in a single network round-trip.
   * @param {string} userId - User's unique identifier
   * @returns {Promise<number>} Number of sessions destroyed
   */
  async destroyAllUserSessions(userId: string): Promise<number> {
    try {
      sessionLogger.info({ userId }, "Destroying all user sessions");
      const sessionSetKey = `${this.SESSION_SET_PREFIX}${userId}`;
      const sessionIds: string[] = (await smembersCache(sessionSetKey)) || [];
      if (sessionIds.length === 0) {
        await deleteCache(sessionSetKey);
        sessionLogger.warn({ userId }, "No active sessions found");
        return 0;
      }
      const redis = getRedisClient();
      const pipeline = redis.pipeline();
      for (const sessionId of sessionIds) {
        const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
        pipeline.del(sessionKey);
      }
      pipeline.del(sessionSetKey);
      await pipeline.exec();
      sessionLogger.info(
        { userId, sessionsDestroyed: sessionIds.length },
        "All user sessions destroyed (pipeline)"
      );
      return sessionIds.length;
    } catch (error) {
      sessionLogger.error(
        {
          userId,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to destroy all sessions"
      );
      return 0;
    }
  }

  /**
   * Gets the number of active sessions for a user (always accurate, no desync risk).
   * @param {string} userId - User's unique identifier
   * @returns {Promise<number>} Number of active sessions
   */
  async getActiveSessionCount(userId: string): Promise<number> {
    try {
      const sessionSetKey = `${this.SESSION_SET_PREFIX}${userId}`;
      return await scardCache(sessionSetKey);
    } catch (error) {
      sessionLogger.error(
        {
          userId,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to get active session count"
      );
      return 0;
    }
  }

  // async checkSessionByUserAgent(
  //   userId: string,
  //   userAgent: string
  // ): Promise<string | null> {
  //   sessionLogger.info({ userId }, "Checking session by user agent");
  //   try {
  //     const sessionSetKey = `${this.SESSION_SET_PREFIX}${userId}`;
  //     const sessionIds: string[] = (await smembersCache(sessionSetKey)) || [];

  //     for (const sessionId of sessionIds) {
  //       const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
  //       const sessionData = await getCacheJSON<SessionData>(sessionKey);
  //       if (sessionData && sessionData.userAgent === userAgent) {
  //         sessionLogger.info({ userId, sessionId }, "Session found by user agent");
  //         return sessionId;
  //       }
  //     }
  //     sessionLogger.warn({ userId, userAgent }, "No session found by user agent");
  //     return null;
  //   } catch (error) {
  //     sessionLogger.error(
  //       {
  //         userId,
  //         userAgent,
  //         error: error instanceof Error ? error.message : error,
  //       },
  //       "Failed to check session by user agent"
  //     );
  //     return null;
  //   }
  // }
}

export const sessionService = new SessionService();
