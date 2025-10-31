import { createUserSchema, UserProfile, userProfileSchema, userSchema } from "@shared/types/UserInterface";
import { supabase } from "src/config/supabase/client";
import { userLogger } from "src/utils/logger";
import { mapDbToSchema, mapSchemaToDb } from "src/utils/mapper";
import { z } from "zod";

type User = z.infer<typeof userSchema>;
type CreateUserData = z.infer<typeof createUserSchema>;

class UserRepository {
    private table_name = "users";

    /**
     * Finds a user by their email address
     * @param {string} email - The email address to search for
     * @returns {Promise<User | null>} The user object if found, null otherwise
     * @throws {Error} If database query fails
     */
    async findUserForAuthByEmail(email: string): Promise<User | null> {
        userLogger.info(`Finding user for auth by email: ${email}`);
        try {
            const { data, error } = await supabase
                .from(this.table_name)
                .select("*")
                .eq("email", email)
                .maybeSingle();

        if (error) {
            userLogger.error(`Error finding user by email: ${error.message}`);
            throw new Error("Error finding user by email", { cause: error });
        }

        if (!data) {
            userLogger.error(`No user found with email: ${email}`);
            return null;
        }

        userLogger.info(`User found with email: ${email}`);
        return userSchema.parse(mapDbToSchema(data));
        } catch (error) {
        userLogger.error(`Exception in findUserForAuthByEmail: ${error}`);
        throw error;
        }
    }

    async findUserById(id: string): Promise<User | null> {
        userLogger.info(`Finding user by id: ${id}`);
        try {
            const { data, error } = await supabase
                .from(this.table_name)
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (error) {
                userLogger.error(`Error finding user by id: ${error.message}`);
                throw new Error("Error finding user by id", { cause: error });
            }

            if (!data) {
                userLogger.error(`No user found with id: ${id}`);
                return null;
            }

            userLogger.info(`User found with id: ${id}`);
            return userSchema.parse(mapDbToSchema(data));
        } catch (error) {
        userLogger.error(`Exception in findUserById: ${error}`);
        throw error;
        }
    }

    /**
     * Creates a new user in the database
     * @param {CreateUserData} userData - User data for creation
     * @returns {Promise<User | null>} The newly created user object, null if creation fails
     * @throws {Error} If user creation fails
     */
    async createUser(userData: CreateUserData): Promise<User | null> {
        userLogger.info(`Creating user with email: ${userData.email}`);
        try {
        const dbUserData = mapSchemaToDb(userData);
        const { data, error } = await supabase
            .from(this.table_name)
            .insert(dbUserData)
            .select()
            .single();

        if (error) {
            userLogger.error(`Error creating user: ${error.message}`);
            throw new Error("Error creating user", { cause: error });
        }

        if (!data) {
            userLogger.error(`No user created with email: ${userData.email}`);
            throw new Error("User creation failed");
        }

        userLogger.info(`User created with email: ${userData.email}`);
        return userSchema.parse(mapDbToSchema(data));
        } catch (error) {
        userLogger.error(`Exception in createUser: ${error}`);
        throw error;
        }
    }

    async getProfileById(id: string): Promise<UserProfile | null> {
        userLogger.info(`Getting profile for user id: ${id}`);
        try {
            const { data, error } = await supabase
                .from(this.table_name)
                .select("id, email, first_name, last_name, avatar_url, created_at, updated_at")
                .eq("id", id)
                .single();

            if (error) {
                userLogger.error(`Error getting user profile: ${error.message}`);
                throw new Error("Error getting user profile", { cause: error });
            }

            if (!data) {
                userLogger.error(`No profile found for user id: ${id}`);
                return null;
            }

            userLogger.info(`Profile found for user id: ${id}`);
            return userProfileSchema.parse(mapDbToSchema(data));
        } catch (error) {
        userLogger.error(`Exception in getProfileById: ${error}`);
        throw error;
        }
    }

    /**
     * Deletes a user from the database
     * @param {string} id - The user ID to delete
     * @returns {Promise<boolean>} True if deletion was successful
     * @throws {Error} If user deletion fails
     */
    async deleteUser(id: string): Promise<boolean> {
        userLogger.info(`Deleting user with id: ${id}`);
        try {
        const { error } = await supabase
            .from(this.table_name)
            .update({ is_active: false })
            .eq("id", id);

        if (error) {
            userLogger.error(`Error deleting user: ${error.message}`);
            throw new Error("Error deleting user", { cause: error });
        }

        userLogger.info(`User deleted with id: ${id}`);
        return true;
        } catch (error) {
        userLogger.error(`Exception in deleteUser: ${error}`);
        throw error;
        }
    }

    /**
     * Updates user profile
     * @param {string} id - The user ID to update
     * @param {Partial<User>} updates - Partial user data to update
     * @returns {Promise<User | null>} The updated user object if successful, null otherwise
     * @throws {Error} If user update fails
     */
    async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
        userLogger.info(`Updating profile for user id: ${id}`);
        try {
        const dbUpdates = mapSchemaToDb(updates);
        const { data, error } = await supabase
            .from(this.table_name)
            .update(dbUpdates)
            .eq("id", id)
            .single();

        if (error) {
            userLogger.error(`Error updating user profile: ${error.message}`);
            throw new Error("Error updating user profile", { cause: error });
        }

        if (!data) {
            userLogger.error(`No user profile found to update for id: ${id}`);
            return null;
        }

        userLogger.info(`User profile updated successfully for id: ${id}`);
        return userProfileSchema.parse(mapDbToSchema(data));
    } catch (error) {
        userLogger.error(`Exception in updateUserProfile: ${error}`);
        throw error;
    }
}

    /**
     * Updates the avatar URL for a user.
     * @param {string} id - The user ID whose avatar will be updated.
     * @param {string} avatarUrl - The new avatar URL.
     * @returns {Promise<UserProfile>} The updated user profile object.
     * @throws {Error} If user not found or update fails.
     */
    async updateAvatar(id: string, avatarUrl: string): Promise<UserProfile> {
        userLogger.info(`Updating avatar for user id: ${id}`);
        try {
            userLogger.info(`Setting new avatar URL: ${avatarUrl}`);
            const updatedUser = await this.updateUserProfile(id, { avatarUrl: avatarUrl });

            if (!updatedUser) {
                userLogger.error(`No user found to update avatar for id: ${id}`);
                throw new Error("User not found or update failed");
            }

            userLogger.info(`Avatar updated successfully for user id: ${id}`);
            return updatedUser;
        } catch (error) {
            userLogger.error(`Error updating avatar for user id: ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Updates the email address for a user.
     * @param {string} id - The user ID whose email will be updated.
     * @param {string} newEmail - The new email address.
     * @returns {Promise<UserProfile>} The updated user profile object.
     * @throws {Error} If user not found or update fails.
     */
    async updateEmail(id: string, newEmail: string): Promise<UserProfile> {
        userLogger.info(`Updating email for user id: ${id}`);
        try {
            userLogger.info(`Setting new email: ${newEmail}`);
            const updatedUser = await this.updateUserProfile(id, { email: newEmail });

            if (!updatedUser) {
                userLogger.error(`No user found to update email for id: ${id}`);
                throw new Error("User not found or update failed");
            }

            userLogger.info(`Email updated successfully for user id: ${id}`);
            return updatedUser;
        } catch (error) {
            userLogger.error(`Error updating email for user id: ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Updates a user's password
     * @param {string} id - The user ID whose password to update
     * @param {string} newPassword - The new hashed password
     * @returns {Promise<boolean>} True if password update was successful
     * @throws {Error} If password update fails
     */
    async updatePassword(id: string, newPassword: string): Promise<boolean> {
        userLogger.info(`Updating password for user id: ${id}`);
        try {
            const { data, error } = await supabase
            .from(this.table_name)
            .update({ password: newPassword })
            .eq("id", id)
            .single();

            if (error) {
                userLogger.error(`Error updating password: ${error.message}`);
                throw new Error("Error updating password", { cause: error });
            }

            if (!data) {
                userLogger.error(`No user found with id: ${id}`);
                throw new Error("User not found");
            }

            userLogger.info(`Password updated successfully for user id: ${id}`);
            return true;
        } catch (error) {
            userLogger.error(`Exception in updatePassword: ${error}`);
            throw error;
        }
    }
}

export const userRepository = new UserRepository()  