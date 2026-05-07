import { z } from "zod";

export const flashcardFormSchema = z.object({
  front: z
    .string()
    .min(1, "Front is required")
    .max(8000, "Front is too long"),
  back: z
    .string()
    .min(1, "Back is required")
    .max(8000, "Back is too long"),
});

export type FlashcardFormValues = z.infer<typeof flashcardFormSchema>;

export const generateFlashcardsSchema = z.object({
  materialText: z
    .string()
    .min(20, "Provide at least 20 characters of study material")
    .max(100_000, "Material is too long"),
  maxCards: z.coerce
    .number()
    .int()
    .min(1, "Must be at least 1")
    .max(50, "Up to 50 cards"),
  persist: z.boolean().optional(),
  model: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
});

export type GenerateFlashcardsValues = z.infer<
  typeof generateFlashcardsSchema
>;
