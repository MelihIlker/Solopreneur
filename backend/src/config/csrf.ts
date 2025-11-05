import { Request, Response, NextFunction } from "express";
import { csrfService } from "@modules/auth/services/csrf.service";
import { appLogger } from "@utils/logger";

/**
 * Custom CSRF protection middleware using Redis-based session storage
 * This middleware:
 * 1. Generates CSRF token on GET requests
 * 2. Validates CSRF token on POST/PUT/DELETE requests
 * 3. Stores tokens in Redis (not cookies)
 */
export const csrfProtection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get session ID from request
    const sessionId = req.headers["x-session-id"] as string;

    if (!sessionId) {
      appLogger.warn("No session ID provided in request headers");
      return res.status(400).json({ error: "Session ID required" });
    }

    // For GET requests, generate token
    if (req.method === "GET") {
      const token = await csrfService.generateToken(sessionId);
      res.locals.csrfToken = token;
      return next();
    }

    // For POST/PUT/DELETE/PATCH requests, validate token
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
      // Get token from header or body
      const token =
        (req.headers["x-csrf-token"] as string) ||
        (req.body && (req.body as any)._csrf);

      if (!token) {
        appLogger.warn({ sessionId, method: req.method }, "CSRF token missing");
        return res.status(403).json({ error: "CSRF token missing" });
      }

      // Validate token
      const isValid = await csrfService.validateToken(sessionId, token);

      if (!isValid) {
        appLogger.warn(
          { sessionId, method: req.method },
          "CSRF token validation failed"
        );
        return res.status(403).json({ error: "Invalid CSRF token" });
      }

      res.locals.csrfToken = await csrfService.refreshToken(sessionId);
    }

    next();
  } catch (error) {
    appLogger.error(
      { error: error instanceof Error ? error.message : error },
      "CSRF middleware error"
    );
    res.status(500).json({ error: "CSRF validation error" });
  }
};