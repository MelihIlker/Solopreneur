import {
  loginResponseSchema,
  registerResponseSchema,
} from "@shared/types/AuthInterface";
import { createUserSchema, userSchema } from "@shared/types/UserInterface";
import { z } from "zod";

export const LoginDtoSchema = z.object({
  email: userSchema.shape.email,
  password: z.string().min(8),
  honeypot: z.string().optional(),
});

export const RegisterDtoSchema = createUserSchema;

export const RegisterResponseSchema = registerResponseSchema;

export const LoginResponseSchema = loginResponseSchema;

export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
