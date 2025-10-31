/**
 * @module AuthInterface
 * @description Zod schemas for authentication responses (register, login)
 */

import z from "zod";
import { userSchema } from "./UserInterface";

/**
 * @typedef {Object} RegisterResponse
 * @property {Object} user - User object (safe fields only)
 * @property {string} user.id - User's unique identifier (UUID)
 * @property {string} user.email - User's email address
 * @property {string} user.firstName - User's first name
 * @property {string} user.lastName - User's last name
 * @property {string} [user.avatarUrl] - Optional URL to user's avatar image
 * @property {boolean} user.isAdmin - Whether the user has admin privileges
 * @property {Date} user.createdAt - Timestamp of user creation
 * @property {Date} user.updatedAt - Timestamp of last user update
 */
export const registerResponseSchema = z.object({
  user: z.object({
    id: userSchema.shape.id,
    email: userSchema.shape.email,
    firstName: userSchema.shape.firstName,
    lastName: userSchema.shape.lastName,
    avatarUrl: userSchema.shape.avatarUrl,
    isAdmin: userSchema.shape.isAdmin,
    createdAt: userSchema.shape.createdAt,
    updatedAt: userSchema.shape.updatedAt,
  }),
});

/**
 * @typedef {Object} LoginResponse
 * @property {Object} user - User object (safe fields only)
 * @property {string} user.id - User's unique identifier (UUID)
 * @property {string} user.email - User's email address
 * @property {string} user.firstName - User's first name
 * @property {string} user.lastName - User's last name
 * @property {string} [user.avatarUrl] - Optional URL to user's avatar image
 * @property {boolean} user.isAdmin - Whether the user has admin privileges
 * @property {Date} user.createdAt - Timestamp of user creation
 * @property {Date} user.updatedAt - Timestamp of last user update
 * @property {string} [session_id] - Optional session identifier (Redis session ID)
 */
export const loginResponseSchema = z.object({
  user: z.object({
    id: userSchema.shape.id,
    email: userSchema.shape.email,
    firstName: userSchema.shape.firstName,
    lastName: userSchema.shape.lastName,
    isAdmin: userSchema.shape.isAdmin,
    createdAt: userSchema.shape.createdAt,
    updatedAt: userSchema.shape.updatedAt,
    avatarUrl: userSchema.shape.avatarUrl,
  }),
  session_id: z.string().optional(),
});
