import { z } from "zod";

export const createSubjectBodySchema = z.object({
  name: z.string().min(1, "name is required").max(200),
  description: z.string().max(10_000).optional(),
  imageUrl: z.url("invalid image URL").max(2048).optional(),
  isActive: z.boolean().optional(),
});

export const updateSubjectBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.union([z.string().max(10_000), z.null()]).optional(),
    imageUrl: z.union([z.url().max(2048), z.literal(""), z.null()]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "at least one field must be provided",
  });

export type CreateSubjectBody = z.infer<typeof createSubjectBodySchema>;
export type UpdateSubjectBody = z.infer<typeof updateSubjectBodySchema>;
