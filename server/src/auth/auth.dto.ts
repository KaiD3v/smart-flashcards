import { z } from "zod";

const nicknameSchema = z
  .string()
  .min(2, "nickname must be at least 2 characters")
  .max(32, "nickname must be at most 32 characters")
  .refine((s) => !/\s/.test(s), "nickname must not contain spaces")
  .regex(/^[a-zA-Z0-9_]+$/, "nickname may only contain letters, numbers and underscore");

const passwordSchema = z
  .string()
  .min(8, "password must be at least 8 characters")
  .max(128, "password must be at most 128 characters");

export const registerBodySchema = z.object({
  email: z.email("invalid email"),
  nickname: nicknameSchema,
  name: z.string().max(120).optional(),
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: z.email("invalid email"),
  password: z.string().min(1, "password is required"),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
