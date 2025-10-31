import { sessionService } from "@modules/auth/services/session.service";
import { Request, Response, NextFunction } from "express";
import { authLogger } from "src/utils/logger";

export async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    authLogger.info('AuthMiddleware invoked');
    try {
        console.log('Cookies in AuthMiddleware:', req.cookies);
        const sessionId = req.cookies['access_token'];
        if (!sessionId) {
            authLogger.error('No access_token cookie found');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessionData = await sessionService.validateSession(sessionId);
        if (!sessionData) {
            authLogger.error({ sessionId }, 'Invalid session in AuthMiddleware');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        authLogger.info({ userId: sessionData.userId }, 'User authenticated successfully in AuthMiddleware');
        (req as any).sessionData = sessionData;
        return next();
    } catch (error) {
        authLogger.error({ error: error instanceof Error ? error.message : String(error) }, 'Exception in AuthMiddleware');
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}