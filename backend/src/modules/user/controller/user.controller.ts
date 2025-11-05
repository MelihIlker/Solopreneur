import { userLogger } from "@utils/logger";
import { Request, Response } from "express";
import { userService } from "../services/user.service";


export class UserController {
    async getProfile(req: Request, res: Response) {
        userLogger.info(`Received request to get user profile`);
        try {
            const userId = req.headers['x-user-id'] as string;

            const profile = await userService.getUserProfile(userId);
            res.status(200).json({ profile, message: "User profile fetched successfully" });
        } catch (error: any) {
            userLogger.error(`Error getting user profile: ${error.message}`);
            res.status(500).json({ error: "Error getting user profile" });
        }
    }

    async updateProfile(req: Request, res: Response) {
        userLogger.info(`Received request to update user profile`);
        try {
            const userId = req.headers['x-user-id'] as string;
            const updates = req.body;

            const updatedProfile = await userService.updateUserProfile(userId, updates);
            res.status(200).json({ profile: updatedProfile, message: "User profile updated successfully" });
        } catch (error: any) {
            userLogger.error(`Error updating user profile: ${error.message}`);
            res.status(500).json({ error: "Error updating user profile" });
        }
    }

    async deleteUser(req: Request, res: Response) {
        userLogger.info(`Received request to delete user`);
        try {
            const userId = req.headers['x-user-id'] as string;

            await userService.deleteUser(userId);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error: any) {
            userLogger.error(`Error deleting user: ${error.message}`);
            res.status(500).json({ error: "Error deleting user" });
        }
    }

    async changePassword(req: Request, res: Response) {
        userLogger.info(`Received request to change password`);
        try {
            const userId = req.headers['x-user-id'] as string;
            const { currentPassword, newPassword } = req.body;

            await userService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({ message: "Password changed successfully" });
        } catch (error: any) {
            userLogger.error(`Error changing password: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    }

    async changeEmail(req: Request, res: Response) {
        userLogger.info(`Received request to change email`);
        try {
            const userId = req.headers['x-user-id'] as string;
            const { newEmail } = req.body;

            await userService.changeEmail(userId, newEmail);
            res.status(200).json({ message: "Email changed successfully" });
        } catch (error: any) {
            userLogger.error(`Error changing email: ${error.message}`);
            res.status(500).json({ error: "Error changing email" });
        }
    }
}

export const userController = new UserController();