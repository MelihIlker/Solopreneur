import { userLogger } from "src/utils/logger";
import { userRepository } from "@modules/user/repositories/user.repository";
import { UserProfile } from "@shared/types/UserInterface";
import { sessionService } from "@modules/auth/services/session.service";
import argon2 from "argon2";

class UserService {
    async getUserProfile(id: string): Promise<UserProfile | Error> {
        userLogger.info(`Getting user profile for id: ${id}`);
        try {
            const profile = await userRepository.getProfileById(id);

            if (!profile) {
                userLogger.error(`User profile not found for id: ${id}`);
                throw new Error("User profile not found");
            }

            userLogger.info(`User profile found for id: ${id}`);
            return profile;
        } catch (error: any) {
            userLogger.error(`Error getting user profile: ${error.message}`);
            throw new Error("Error getting user profile", { cause: error });
        }
    }

    async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | Error> {
        userLogger.info(`Updating user profile for id: ${id}`);
        try {
            const updatedProfile = await userRepository.updateUserProfile(id, updates);

            if (!updatedProfile) {
                userLogger.error(`User profile not found for id: ${id}`);
                throw new Error("User profile not found");
            }

            userLogger.info(`User profile updated for id: ${id}`);
            return updatedProfile;
        } catch (error: any) {
            userLogger.error(`Error updating user profile: ${error.message}`);
            throw new Error("Error updating user profile", { cause: error });
        }
    }

    async deleteUser(id: string): Promise<void | Error> {
        userLogger.info(`Deleting user with id: ${id}`);
        try {
            const user = await userRepository.getProfileById(id);
            if (!user) {
                userLogger.error(`User not found for id: ${id}`);
                throw new Error("User not found");
            }

            const deleteAllSessions = await sessionService.destroyAllUserSessions(id);
            if (!deleteAllSessions) {
                userLogger.error(`Failed to delete sessions for user id: ${id}`);
                throw new Error("Failed to delete user sessions");
            }

            await userRepository.deleteUser(id);
            userLogger.info(`User deleted with id: ${id}`);
        } catch (error: any) {
            userLogger.error(`Error deleting user: ${error.message}`);
            throw new Error("Error deleting user", { cause: error });
        }
    }

    async changePassword(id: string, currentPassword: string, newPassword: string): Promise<Boolean | Error> {
        userLogger.info(`Changing password for user id: ${id}`);
        try {
            const user = await userRepository.findUserById(id);
            if (!user) {
                userLogger.error(`User not found for id: ${id}`);
                throw new Error("User not found");
            }

            const validPassword = await argon2.verify(user.password, currentPassword);
            if (!validPassword) {
                userLogger.error(`Current password is incorrect for user id: ${id}`);
                throw new Error("Current password is incorrect");
            }

            const verifyPassword = await argon2.verify(user.password, newPassword);
            if (verifyPassword) {
                userLogger.error(`New password cannot be the same as the old password for user id: ${id}`);
                throw new Error("New password cannot be the same as the old password");
            }

            const hashedPassword = await argon2.hash(newPassword);
            await userRepository.updatePassword(id, hashedPassword);
            userLogger.info(`Password changed for user id: ${id}`);

            return true;
        } catch (error: any) {
            userLogger.error(`Error changing password: ${error.message}`);
            throw new Error("Error changing password", { cause: error });
        }
    }

    async changeEmail(id: string, newEmail: string): Promise<Boolean | Error> {
        userLogger.info(`Changing email for user id: ${id}`);
        try {
            const user = await userRepository.getProfileById(id);
            if (!user) {
                userLogger.error(`User not found for id: ${id}`);
                throw new Error("User not found");
            }

            if (user.email === newEmail) {
                userLogger.error(`New email cannot be the same as the old email for user id: ${id}`);
                throw new Error("New email cannot be the same as the old email");
            }

            // TODO: implement email change confirmation workflow (send verification to newEmail before switching)
            await userRepository.updateEmail(id, newEmail);
            userLogger.info(`Email changed for user id: ${id}`);

            return true;
        } catch (error: any) {
            userLogger.error(`Error changing email: ${error.message}`);
            throw new Error("Error changing email", { cause: error });
        }
    }
}

export const userService = new UserService();