import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { emailBlocklistMiddleware } from "@shared/middleware/email-block.middleware";
import { ipBlocklistMiddleware } from "@shared/middleware/ip-block.middleware";
import { AuthMiddleware } from "@shared/middleware/auth-middleware";
import { createRateLimitMiddleware } from "@shared/middleware/createRateLimit.middleware";
import { LOOSE_RATE_LIMIT_CONFIG, RATE_LIMIT_CONFIG } from "@config/config";
import { csrfProtection } from "@config/csrf";

const authRouter = Router();

// Register route
authRouter.post(
  "/register",
  createRateLimitMiddleware({
    WINDOW_MS: RATE_LIMIT_CONFIG.WINDOW_MS,
    MAX_REQUESTS: RATE_LIMIT_CONFIG.MAX_REQUESTS,
    KEY_PREFIX: "register",
  }),
  emailBlocklistMiddleware,
  ipBlocklistMiddleware,
  csrfProtection,
  (req, res) => authController.register(req, res)
);

// Login route
authRouter.post(
  "/login",
  createRateLimitMiddleware({
    WINDOW_MS: RATE_LIMIT_CONFIG.WINDOW_MS,
    MAX_REQUESTS: RATE_LIMIT_CONFIG.MAX_REQUESTS,
    KEY_PREFIX: "login",
  }),
  emailBlocklistMiddleware,
  ipBlocklistMiddleware,
  csrfProtection,
  (req, res) => authController.login(req, res)
);

// Logout route
authRouter.post(
  "/logout",
  createRateLimitMiddleware({
    WINDOW_MS: LOOSE_RATE_LIMIT_CONFIG.WINDOW_MS,
    MAX_REQUESTS: LOOSE_RATE_LIMIT_CONFIG.MAX_REQUESTS,
    KEY_PREFIX: "logout",
  }),
  AuthMiddleware,
  ipBlocklistMiddleware,
  csrfProtection,
  (req, res) => authController.logout(req, res)
);

// Me route
authRouter.get(
  "/me",
  createRateLimitMiddleware({
    WINDOW_MS: LOOSE_RATE_LIMIT_CONFIG.WINDOW_MS,
    MAX_REQUESTS: LOOSE_RATE_LIMIT_CONFIG.MAX_REQUESTS,
    KEY_PREFIX: "me",
  }),
  AuthMiddleware,
  ipBlocklistMiddleware,
  (req, res) => authController.me(req, res)
);

export default authRouter;
