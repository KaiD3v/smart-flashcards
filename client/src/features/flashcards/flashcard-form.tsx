"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  flashcardFormSchema,
  type FlashcardFormValues,
} from "./flashcard-schemas";

interface FlashcardFormProps {
  defaultValues?: Partial<FlashcardFormValues>;
  submitLabel?: string;
  onSubmit: (values: FlashcardFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function FlashcardForm({
  defaultValues,
  submitLabel = "Save flashcard",
  onSubmit,
  onCancel,
}: FlashcardFormProps) {
  const form = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      front: defaultValues?.front ?? "",
      back: defaultValues?.back ?? "",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="front">Front (question)</Label>
        <Textarea
          id="front"
          rows={3}
          placeholder="What is the powerhouse of the cell?"
          aria-invalid={Boolean(form.formState.errors.front)}
          {...form.register("front")}
        />
        {form.formState.errors.front ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.front.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="back">Back (answer)</Label>
        <Textarea
          id="back"
          rows={4}
          placeholder="The mitochondrion."
          aria-invalid={Boolean(form.formState.errors.back)}
          {...form.register("back")}
        />
        {form.formState.errors.back ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.back.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="gradient"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
