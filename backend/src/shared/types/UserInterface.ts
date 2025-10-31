import z from "zod";

/**
 * Base user schema for common user fields
 * Contains email, password, firstName, and lastName validation rules
 */
const baseUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
});

/**
 * Schema for creating a new user
 * Extends baseUserSchema with strict password requirements:
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 * @type {z.ZodObject}
 */
export const createUserSchema = baseUserSchema.extend({
  confirmPassword: z.string().min(8).max(100), // For password confirmation
  honeypot: z.string().optional(), // For spam prevention
  password: baseUserSchema.shape.password
    .regex(/(?=.*[A-Z])/, "must contain at least one uppercase letter")
    .regex(/(?=.*[0-9])/, "must contain at least one number")
    .regex(/(?=.*[!@#$%^&*])/, "must contain at least one special character"),
});

/**
 * Complete user schema with all user properties
 * Includes auto-generated fields (id, createdAt, updatedAt)
 * @type {z.ZodObject}
 * @property {string} id - UUID of the user
 * @property {string} email - User's email address
 * @property {string} password - Hashed password (8-100 characters)
 * @property {string} firstName - User's first name (2-100 characters)
 * @property {string} lastName - User's last name (2-100 characters)
 * @property {string} [avatarUrl] - Optional URL to user's avatar image
 * @property {boolean} isAdmin - Whether the user has admin privileges (default: false)
 * @property {Date} createdAt - Timestamp of user creation
 * @property {Date} updatedAt - Timestamp of last user update
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  avatarUrl: z.string().optional().nullable().transform(val => val ?? ""),
  isAdmin: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.preprocess((val) => (val == null ? undefined : new Date(val as string)), z.date().optional()),
  updatedAt: z.preprocess((val) => (val == null ? undefined : new Date(val as string)), z.date().optional()),
});

export const userProfileSchema = userSchema.omit({ password: true });
export type UserProfile = z.infer<typeof userProfileSchema>;