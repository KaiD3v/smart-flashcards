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

export const createUserBodySchema = z.object({
  email: z.email("invalid email"),
  nickname: nicknameSchema,
  name: z.string().max(120).optional(),
  password: passwordSchema,
});

export const updateUserBodySchema = z
  .object({
    email: z.email("invalid email").optional(),
    nickname: nicknameSchema.optional(),
    name: z.union([z.string().max(120), z.null()]).optional(),
    password: passwordSchema.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "at least one field must be provided",
  });

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
