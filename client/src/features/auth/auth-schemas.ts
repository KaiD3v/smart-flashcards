import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .max(120, "Name is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  nickname: z
    .string()
    .min(2, "Nickname must be at least 2 characters")
    .max(32, "Nickname must be at most 32 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Use only letters, numbers and underscores"
    ),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const profileSchema = z.object({
  name: z
    .string()
    .max(120, "Name is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  nickname: z
    .string()
    .min(2, "Nickname must be at least 2 characters")
    .max(32, "Nickname must be at most 32 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Use only letters, numbers and underscores"
    ),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
