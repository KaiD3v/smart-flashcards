import { z } from "zod";

const optionalUrl = z
  .string()
  .max(2048, "URL is too long")
  .refine(
    (value) => {
      if (value.length === 0) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Enter a valid URL" }
  );

export const subjectFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name is too long"),
  description: z
    .string()
    .max(10_000, "Description is too long")
    .optional(),
  imageUrl: optionalUrl.optional(),
  isActive: z.boolean().optional(),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
