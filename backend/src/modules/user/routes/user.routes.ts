import { Router } from "express";
import { userController } from "../controller/user.controller";
import { createRateLimitMiddleware } from "@shared/middleware/createRateLimit.middleware";
import { LOOSE_RATE_LIMIT_CONFIG, RATE_LIMIT_CONFIG } from "@config/config";
import { emailBlocklistMiddleware } from "@shared/middleware/email-block.middleware";
import { AuthMiddleware } from "@shared/middleware/auth-middleware";
import { ipBlocklistMiddleware } from "@shared/middleware/ip-block.middleware";
import { csrfProtection } from "@config/csrf";


export const userRouter = Router();

// Get user profile route
userRouter.get("/profile",
    createRateLimitMiddleware({
        WINDOW_MS: LOOSE_RATE_LIMIT_CONFIG.WINDOW_MS,
        MAX_REQUESTS: LOOSE_RATE_LIMIT_CONFIG.MAX_REQUESTS,
        KEY_PREFIX: "get-profile",
    }),
    AuthMiddleware,
    ipBlocklistMiddleware,
    (req, res) => userController.getProfile(req, res));

// Update user profile route
userRouter.put("/profile",
    createRateLimitMiddleware({
        WINDOW_MS: LOOSE_RATE_LIMIT_CONFIG.WINDOW_MS,
        MAX_REQUESTS: LOOSE_RATE_LIMIT_CONFIG.MAX_REQUESTS,
        KEY_PREFIX: "update-profile",
    }),
    AuthMiddleware,
    ipBlocklistMiddleware,
    csrfProtection,
    (req, res) => userController.updateProfile(req, res));

// Delete user profile route
userRouter.delete("/profile",
    createRateLimitMiddleware({
        WINDOW_MS: LOOSE_RATE_LIMIT_CONFIG.WINDOW_MS,
        MAX_REQUESTS: LOOSE_RATE_LIMIT_CONFIG.MAX_REQUESTS,
        KEY_PREFIX: "delete-profile",
    }),
    AuthMiddleware,
    ipBlocklistMiddleware,
    csrfProtection,
    (req, res) => userController.deleteUser(req, res));

// Change user password route
userRouter.post("/change-password",
    createRateLimitMiddleware({
        WINDOW_MS: RATE_LIMIT_CONFIG.WINDOW_MS,
        MAX_REQUESTS: RATE_LIMIT_CONFIG.MAX_REQUESTS,
        KEY_PREFIX: "change-password",
    }),
    AuthMiddleware,
    ipBlocklistMiddleware,
    csrfProtection,
    (req, res) => userController.changePassword(req, res));

// Change user email route
userRouter.post("/change-email",
    createRateLimitMiddleware({
        WINDOW_MS: RATE_LIMIT_CONFIG.WINDOW_MS,
        MAX_REQUESTS: RATE_LIMIT_CONFIG.MAX_REQUESTS,
        KEY_PREFIX: "change-email",
    }),
    AuthMiddleware,
    ipBlocklistMiddleware,
    emailBlocklistMiddleware,
    csrfProtection,
    (req, res) => userController.changeEmail(req, res));

export default userRouter;