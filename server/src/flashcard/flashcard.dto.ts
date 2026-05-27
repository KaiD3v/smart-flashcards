import { z } from "zod";

export const createFlashcardBodySchema = z.object({
  front: z.string().min(1).max(8000),
  back: z.string().min(1).max(8000),
  order: z.number().int().min(0).optional(),
});

export const updateFlashcardBodySchema = z
  .object({
    front: z.string().min(1).max(8000).optional(),
    back: z.string().min(1).max(8000).optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "at least one field must be provided",
  });

export const generateFlashcardsBodySchema = z.object({
  materialText: z.string().min(1).max(100_000),
  maxCards: z.number().int().min(1).max(50).optional(),
  model: z.string().min(1).max(200).optional(),
  /** Se true, persiste os cartões gerados na matéria indicada na URL. */
  persist: z.boolean().optional(),
});

export const generateFromFileFieldsSchema = z.object({
  maxCards: z.coerce.number().int().min(1).max(50).optional(),
  model: z
    .string()
    .max(200)
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  persist: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((value) => value === true || value === "true"),
});

export const reviewFlashcardBodySchema = z.object({
  rating: z
    .enum(["again", "hard", "good", "easy"])
    .or(z.enum(["Again", "Hard", "Good", "Easy"]))
    .transform((rating) => rating.toLowerCase() as "again" | "hard" | "good" | "easy"),
});

export type CreateFlashcardBody = z.infer<typeof createFlashcardBodySchema>;
export type UpdateFlashcardBody = z.infer<typeof updateFlashcardBodySchema>;
export type GenerateFlashcardsBody = z.infer<typeof generateFlashcardsBodySchema>;
export type GenerateFromFileFields = z.infer<typeof generateFromFileFieldsSchema>;
export type ReviewFlashcardBody = z.infer<typeof reviewFlashcardBodySchema>;
