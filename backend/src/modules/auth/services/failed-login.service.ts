import { LOGIN_ATTEMPT_CONFIG, PREFIX_CONFIG } from "src/config/config";
import { deleteCache, getCache, setCache, incrCache } from "src/lib/redis";
import { authLogger } from "src/utils/logger";

/**
 * Service for tracking and limiting failed login attempts by IP, device, and email.
 * Provides lockout and clearing mechanisms for brute-force protection.
 */
export class FailedLoginService {
  /**
   * Private helper to record a failed login attempt for any identifier (IP, device, email).
   * Handles increment, lockout, and logging.
   * @param {string} identifier - The value to track (IP, device, or email)
   * @param {string} failedPrefix - Redis prefix for failed attempts
   * @param {string} lockPrefix - Redis prefix for lock/block
   * @param {string} logField - Field name for logging ("ip", "userAgent", "email")
   * @param {string} logBlockMsg - Log message for block/lock
   * @returns {Promise<number>} Number of failed attempts
   */
  private async recordFailedAttemptGeneric(
    identifier: string,
    failedPrefix: string,
    lockPrefix: string,
    logField: string,
    logBlockMsg: string
  ): Promise<number> {
    const key = `${failedPrefix}${identifier}`;
    const attempts = await incrCache(key, LOGIN_ATTEMPT_CONFIG.ATTEMPT_WINDOW);

    if (attempts > LOGIN_ATTEMPT_CONFIG.MAX_ATTEMPTS) {
      await setCache(
        `${lockPrefix}${identifier}`,
        "1",
        LOGIN_ATTEMPT_CONFIG.LOCK_DURATION
      );
      authLogger.warn({ [logField]: identifier }, logBlockMsg);
    }

    return attempts;
  }

  /**
   * Checks if an identifier (IP, device, email) is blocked/locked in Redis.
   * @param {string} identifier - The value to check (IP, device, or email)
   * @param {string} lockPrefix - Redis prefix for lock/block
   * @returns {Promise<boolean>} True if blocked/locked
   */
  private async isBlockedGeneric(
    identifier: string,
    lockPrefix: string
  ): Promise<boolean> {
    const lock = await getCache(`${lockPrefix}${identifier}`);
    return !!lock;
  }

  /**
   * Clears both failed attempts and block/lock for an identifier in Redis.
   * @param {string} identifier - The value to clear (IP, device, or email)
   * @param {string} failedPrefix - Redis prefix for failed attempts
   * @param {string} lockPrefix - Redis prefix for lock/block
   * @returns {Promise<void>}
   */
  private async clearAttemptsGeneric(
    identifier: string,
    failedPrefix: string,
    lockPrefix: string
  ): Promise<void> {
    await deleteCache(`${lockPrefix}${identifier}`);
    await deleteCache(`${failedPrefix}${identifier}`);
  }

  /**
   * Records a failed login attempt for an IP address.
   * Blocks the IP if max attempts are exceeded.
   * @param {string} ip - IP address
   * @returns {Promise<number>} Number of failed attempts
   */
  /**
   * Wrapper for recording failed login attempts by IP.
   */
  async recordFailedAttemptIP(ip: string): Promise<number> {
    return this.recordFailedAttemptGeneric(
      ip,
      PREFIX_CONFIG.FAILED_LOGIN_PREFIX,
      PREFIX_CONFIG.BLOCKED_IP_PREFIX,
      "ip",
      "IP blocked due to too many failed login attempts"
    );
  }

  /**
   * Checks if an IP address is currently blocked.
   * @param {string} ip - IP address
   * @returns {Promise<boolean>} True if blocked
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    return this.isBlockedGeneric(ip, PREFIX_CONFIG.BLOCKED_IP_PREFIX);
  }

  /**
   * Manually blocks an IP address for the lock duration.
   * @param {string} ip - IP address
   * @returns {Promise<void>}
   */
  async lockIP(ip: string): Promise<void> {
    await setCache(
      `${PREFIX_CONFIG.BLOCKED_IP_PREFIX}${ip}`,
      "1",
      LOGIN_ATTEMPT_CONFIG.LOCK_DURATION
    );
  }

  /**
   * Clears failed attempts and block for an IP address.
   * @param {string} ip - IP address
   * @returns {Promise<void>}
   */
  async clearIPAttempts(ip: string): Promise<void> {
    await this.clearAttemptsGeneric(
      ip,
      PREFIX_CONFIG.FAILED_LOGIN_PREFIX,
      PREFIX_CONFIG.BLOCKED_IP_PREFIX
    );
  }

  /**
   * Records a failed login attempt for a device (user agent).
   * Blocks the device if max attempts are exceeded.
   * @param {string} userAgent - Device user agent string
   * @returns {Promise<number>} Number of failed attempts
   */
  /**
   * Wrapper for recording failed login attempts by device/user agent.
   */
  async recordFailedAttemptDevice(userAgent: string): Promise<number> {
    return this.recordFailedAttemptGeneric(
      userAgent,
      PREFIX_CONFIG.FAILED_LOGIN_PREFIX,
      PREFIX_CONFIG.LOCK_ACCOUNT_PREFIX,
      "userAgent",
      "Account locked due to too many failed login attempts"
    );
  }

  /**
   * Checks if a device (user agent) is currently blocked.
   * @param {string} userAgent - Device user agent string
   * @returns {Promise<boolean>} True if blocked
   */
  async isDeviceBlocked(userAgent: string): Promise<boolean> {
    return this.isBlockedGeneric(userAgent, PREFIX_CONFIG.LOCK_ACCOUNT_PREFIX);
  }

  /**
   * Manually blocks a device (user agent) for the lock duration.
   * @param {string} userAgent - Device user agent string
   * @returns {Promise<void>}
   */
  async lockDevice(userAgent: string): Promise<void> {
    await setCache(
      `${PREFIX_CONFIG.LOCK_ACCOUNT_PREFIX}${userAgent}`,
      "1",
      LOGIN_ATTEMPT_CONFIG.LOCK_DURATION
    );
  }

  /**
   * Clears failed attempts and block for a device (user agent).
   * @param {string} userAgent - Device user agent string
   * @returns {Promise<void>}
   */
  async clearDeviceAttempts(userAgent: string): Promise<void> {
    await this.clearAttemptsGeneric(
      userAgent,
      PREFIX_CONFIG.FAILED_LOGIN_PREFIX,
      PREFIX_CONFIG.LOCK_ACCOUNT_PREFIX
    );
  }

  /**
   * Records a failed login attempt for an email address.
   * Locks the account if max attempts are exceeded.
   * @param {string} email - Email address
   * @returns {Promise<number>} Number of failed attempts
   */
  /**
   * Wrapper for recording failed login attempts by email.
   */
  async recordFailedAttemptEmail(email: string): Promise<number> {
    return this.recordFailedAttemptGeneric(
      email,
      PREFIX_CONFIG.FAILED_LOGIN_PREFIX,
      PREFIX_CONFIG.LOCK_ACCOUNT_PREFIX,
      "email",
      "Account locked due to too many failed login attempts"
    );
  }

  /**
   * Checks if an email account is currently locked.
   * @param {string} email - Email address
   * @returns {Promise<boolean>} True if locked
   */
  async isEmailLocked(email: string): Promise<boolean> {
    return this.isBlockedGeneric(email, PREFIX_CONFIG.LOCK_ACCOUNT_PREFIX);
  }

  /**
   * Manually locks an email account for the lock duration.
   * @param {string} email - Email address
   * @returns {Promise<void>}
   */
  async lockEmail(email: string): Promise<void> {
    await setCache(
      `${PREFIX_CONFIG.LOCK_ACCOUNT_PREFIX}${email}`,
      "1",
      LOGIN_ATTEMPT_CONFIG.LOCK_DURATION
    );
  }

  /**
   * Clears failed attempts and lock for an email account.
   * @param {string} email - Email address
   * @returns {Promise<void>}
   */
  async clearEmailAttempts(email: string): Promise<void> {
    await this.clearAttemptsGeneric(
      email,
      PREFIX_CONFIG.FAILED_LOGIN_PREFIX,
      PREFIX_CONFIG.LOCK_ACCOUNT_PREFIX
    );
  }

  /**
   * Gets the remaining allowed failed attempts for an email before lockout.
   * @param {string} email - Email address
   * @returns {Promise<number>} Remaining attempts
   */
  async getEmailRemainingAttempts(email: string): Promise<number> {
    const key = `${PREFIX_CONFIG.FAILED_LOGIN_PREFIX}${email}`;
    const data = await getCache(key);
    const attempts = data ? parseInt(data) : 0;
    return Math.max(0, LOGIN_ATTEMPT_CONFIG.MAX_ATTEMPTS - attempts);
  }
}

export const failedLoginService = new FailedLoginService();
