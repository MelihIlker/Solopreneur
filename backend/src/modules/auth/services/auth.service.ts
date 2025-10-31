import {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
} from "../validators/auth.validators";
import { authLogger } from "src/utils/logger";
import argon2 from "argon2";
import { sessionService } from "./session.service";
import { failedLoginService } from "./failed-login.service";
import { userRepository } from "@modules/user/repositories/user.repository";
import { PREFIX_CONFIG } from "src/config/config";
import { getCache } from "src/lib/redis";

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$ZHVtbXlzaWx0$dummyhashvaluefornonexistentuser";

class AuthService {

  async me(sessionId: string) {
    authLogger.info({ sessionId }, 'Fetching user info in AuthService');
    try {
      const sessionData = await sessionService.validateSession(sessionId);
      if (!sessionData) {
        authLogger.error({ sessionId }, 'Invalid session ID in AuthService');
        throw new Error('Unauthorized');
      }

      authLogger.info({ userId: sessionData.userId }, 'User info fetched successfully in AuthService');
      return sessionData;
    } catch (error) {
      authLogger.error(
        { sessionId, error: error instanceof Error ? error.message : String(error) },
        'Exception in fetching user info'
      );
      throw error;
    }
  }

  /**
   * Registers a new user account.
   * Applies honeypot, IP, and device block checks.
   * @param {RegisterDto} dto - Registration data
   * @param {string} [ip] - Optional IP address
   * @param {string} [userAgent] - Optional device user agent
   * @returns {Promise<RegisterResponse>} Registration result
   * @throws Error if registration fails or blocked
   */
  async register(
    dto: RegisterDto,
    ip?: string,
    userAgent?: string
  ): Promise<RegisterResponse> {
    try {
      authLogger.info({ email: dto.email }, `Starting user registration`);

      if (ip && (await failedLoginService.isIPBlocked(ip))) {
        throw new Error(
          "Your IP is temporarily blocked due to too many failed login attempts."
        );
      }
      if (userAgent && (await failedLoginService.isDeviceBlocked(userAgent))) {
        throw new Error(
          "This device is temporarily blocked due to too many failed login attempts."
        );
      }

      if (dto.honeypot) {
        authLogger.error(
          { email: dto.email },
          `Registration: Honeypot field filled - possible bot`
        );
        await this.simulateProcessing();
        if (ip) await failedLoginService.lockIP(ip);
        if (userAgent) await failedLoginService.lockDevice(userAgent);

        throw new Error("Registration failed. Please try again.");
      }

      if (dto.password !== dto.confirmPassword) {
        authLogger.error(
          { email: dto.email },
          `Registration: Passwords do not match`
        );
        throw new Error("Passwords do not match.");
      }

      const existingUser = await userRepository.findUserForAuthByEmail(dto.email);

      if (existingUser) {
        authLogger.error(
          { email: dto.email },
          `Registration failed: Email already exists`
        );
        throw new Error("Registration failed. Please try again.");
      }

      const hashedPassword = await argon2.hash(dto.password);
      authLogger.info(
        { email: dto.email },
        `Registration: Password hashed successfully`
      );


      const { confirmPassword, honeypot, ...userData } = dto as any;
      const payload = {
        ...userData,
        password: hashedPassword,
      }

      const user = await userRepository.createUser(payload)

      if (!user) {
        authLogger.error(
          { email: dto.email },
          `Registration: Failed to create user`
        );
        throw new Error("Registration failed. Please try again.");
      }
      authLogger.info(
        { email: dto.email },
        `Registration: User successfully registered`
      );

      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword };
    } catch (error) {
      authLogger.error(
        {
          email: dto.email,
          error: error instanceof Error ? error.message : String(error),
        },
        "Exception in registration"
      );
      throw error;
    }
  }

  /**
   * Authenticates a user and creates a session.
   * Applies honeypot, IP, device, and email lock checks.
   * @param {LoginDto} dto - Login data
   * @param {string} [ip] - Optional IP address
   * @param {string} [userAgent] - Optional device user agent
   * @returns {Promise<LoginResponse>} Login result with sessionId
   * @throws Error if login fails or blocked
   */
  async login(
    dto: LoginDto,
    userAgent: string,
    ip?: string,
  ): Promise<LoginResponse> {
    try {
      authLogger.info({ email: dto.email }, `Starting user login`);

      if (ip && (await failedLoginService.isIPBlocked(ip))) {
        throw new Error(
          "Your IP is temporarily blocked due to too many failed login attempts."
        );
      }
      if (userAgent && (await failedLoginService.isDeviceBlocked(userAgent))) {
        throw new Error(
          "This device is temporarily blocked due to too many failed login attempts."
        );
      }
      if (await failedLoginService.isEmailLocked(dto.email)) {
        throw new Error(
          "This email is temporarily locked due to too many failed login attempts."
        );
      }

      if (dto.honeypot) {
        authLogger.warn(
          { email: dto.email },
          `Login: Honeypot field filled - possible bot`
        );
        await this.simulateProcessing();
        if (ip) await failedLoginService.lockIP(ip);
        if (userAgent) await failedLoginService.lockDevice(userAgent);

        throw new Error("Invalid email or password");
      }

      const user = await userRepository.findUserForAuthByEmail(dto.email);
      const hashedPassword = user?.password || DUMMY_PASSWORD_HASH;
      const passwordValid = await argon2.verify(hashedPassword, dto.password);

      if (!user || !passwordValid) {
        if (ip) await failedLoginService.recordFailedAttemptIP(ip);
        if (userAgent)
          await failedLoginService.recordFailedAttemptDevice(userAgent);
        await failedLoginService.recordFailedAttemptEmail(dto.email);
        authLogger.error(
          { email: dto.email },
          `Login: Invalid email or password`
        );
        throw new Error("Invalid email or password");
      }

      if (ip) await failedLoginService.clearIPAttempts(ip);
      if (userAgent) await failedLoginService.clearDeviceAttempts(userAgent);
      await failedLoginService.clearEmailAttempts(dto.email);

      const deviceKey = `${PREFIX_CONFIG.DEVICE_SESSION_PREFIX}${user.id}:${userAgent}`;
      const oldKey = await getCache(deviceKey);
      if (oldKey) {
        await sessionService.destroySession(oldKey);
        authLogger.info(
          { email: dto.email, oldSessionId: oldKey },
          `Login: Old session destroyed for device`
        );
      }

      let sessionId: string | undefined;
      if (user.id && user.email && ip && userAgent) {
        sessionId = await sessionService.createSession(
          user,
          ip,
          userAgent
        );
      }

      authLogger.info(
        { email: dto.email, sessionId },
        `Login: User logged in successfully`
      );
      const { password, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, session_id: sessionId } ;
    } catch (error) {
      authLogger.error(
        {
          email: dto.email,
          error: error instanceof Error ? error.message : String(error),
        },
        "Exception in login"
      );
      throw error;
    }
  }

  /**
   * Logs out the user by destroying all active sessions for the user.
   * @param {string} userId - User's unique identifier
   * @returns {Promise<void>}
   * @throws Error if logout fails
   */
  async logout(sessionId: string): Promise<void> {
    try {
      authLogger.info({ sessionId }, "Logout: Destroying user session");
      const session = await sessionService.validateSession(sessionId);
      if (!session) {
        authLogger.error({ sessionId }, "Logout: Invalid session ID");
        throw new Error("Invalid session");
      }

      const destroyed = await sessionService.destroyAllUserSessions(session.userId);
      if (!destroyed) {
        throw new Error("Failed to destroy session");
      }

      authLogger.info({ session }, "Logout: Session destroyed");
    } catch (error) {
      authLogger.error(
        {
          sessionId,
          error: error instanceof Error ? error.message : String(error),
        },
        "Exception in logout"
      );
      throw error;
    }
  }

  /**
   * Simulates processing delay for honeypot/bot protection.
   * @returns {Promise<void>}
   */
  private async simulateProcessing(): Promise<void> {
    const delay = Math.floor(Math.random() * 200) + 100; // 100-300ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export const authService = new AuthService();
