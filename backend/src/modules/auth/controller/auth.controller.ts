import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { authLogger } from "src/utils/logger";
import { COOKIE_CONFIG } from "src/config/config";

export class AuthController {
  async me(req: Request, res: Response) {
    authLogger.info("Fetching user info");
    try {
      const sessionId = req.cookies["access_token"];
      if (!sessionId) {
        authLogger.error("No session ID provided");
        return res.status(401).json({ error: "Unauthorized" });
      }

      const sessionData = await authService.me(sessionId);
      if (!sessionData) {
        authLogger.error({ sessionId }, "Invalid session");
        return res.status(401).json({ error: "Unauthorized" });
      }

      authLogger.info(
        { userId: sessionData.userId },
        "User info fetched successfully"
      );
      res.status(200).json({ user: sessionData });
    } catch (error) {
      authLogger.error({ error: error instanceof Error ? error.message : String(error) }, "Failed to fetch user info");
      res
        .status(500)
        .json({
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { body, ip, headers } = req;
      const userAgent = headers["user-agent"] || "unknown";
      authLogger.info(
        { email: body.email, ip, userAgent },
        "Register request received"
      );

      const result = await authService.register(body, ip, userAgent);

      authLogger.info(
        { email: body.email, redirect: "/login" },
        "Register successful"
      );
      res.status(201).json({
        user: result,
        message: "Registration successful!",
        redirect: "/user/dashboard",
      });
    } catch (error) {
      authLogger.error({ email: req.body?.email, error }, "Register failed");
      res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { body, ip, headers } = req;
      const userAgent = headers["user-agent"] || "unknown";
      const cookie = req.cookies["access_token"];
      if (cookie) {
        res.clearCookie("access_token", {
          httpOnly: COOKIE_CONFIG.HTTP_ONLY,
          sameSite: COOKIE_CONFIG.SAME_SITE,
          secure: COOKIE_CONFIG.SECURE,
          path: COOKIE_CONFIG.PATH,
          domain: COOKIE_CONFIG.DOMAIN,
        });
        authLogger.info("Existing access_token cookie cleared before login");
      }
      authLogger.info(
        { email: body.email, ip, userAgent },
        "Login request received"
      );

      const result = await authService.login(body, userAgent, ip);

      res.cookie("access_token", result.session_id, {
        maxAge: COOKIE_CONFIG.MAX_AGE * 1000,
        httpOnly: COOKIE_CONFIG.HTTP_ONLY,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        secure: COOKIE_CONFIG.SECURE,
        path: COOKIE_CONFIG.PATH,
        domain: COOKIE_CONFIG.DOMAIN,
      });
      authLogger.info(
        { email: body.email },
        "Login successful and token cookies set"
      );

      const redirectUrl = result.user.isAdmin
        ? "/admin/dashboard"
        : "/user/dashboard";
      res
        .status(200)
        .json({
          user: result.user,
          message: "Login successful!",
          redirect: redirectUrl,
        });
    } catch (error) {
      authLogger.error({ email: req.body?.email, error }, "Login failed");
      res
        .status(401)
        .json({
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const sessionId = req.cookies["access_token"];
      if (!sessionId) {
        authLogger.error("No session ID provided for logout");
        return res.status(400).json({ error: "No session to logout" });
      }

      await authService.logout(sessionId);
      res.clearCookie("access_token", {
        httpOnly: COOKIE_CONFIG.HTTP_ONLY,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        secure: COOKIE_CONFIG.SECURE,
        path: COOKIE_CONFIG.PATH,
        domain: COOKIE_CONFIG.DOMAIN,
      });
      authLogger.info(
        { sessionId },
        "Logout successful and token cookie cleared"
      );
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      authLogger.error({ error }, "Logout failed");
      res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }
}

export const authController = new AuthController();
