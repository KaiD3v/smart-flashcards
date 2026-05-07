"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  subjectFormSchema,
  type SubjectFormValues,
} from "./subject-schemas";

interface SubjectFormProps {
  defaultValues?: Partial<SubjectFormValues>;
  submitLabel?: string;
  onSubmit: (values: SubjectFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function SubjectForm({
  defaultValues,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: SubjectFormProps) {
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      imageUrl: defaultValues?.imageUrl ?? "",
      isActive: defaultValues?.isActive ?? true,
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
        <Label htmlFor="name">Subject name</Label>
        <Input
          id="name"
          placeholder="e.g. Cell Biology"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">
          Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="What will you study in this subject?"
          {...form.register("description")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="imageUrl">
          Cover image URL{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="imageUrl"
          placeholder="https://…"
          {...form.register("imageUrl")}
        />
        {form.formState.errors.imageUrl ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.imageUrl.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
        <div>
          <p className="text-sm font-medium">Active</p>
          <p className="text-xs text-muted-foreground">
            Inactive subjects are hidden from the dashboard.
          </p>
        </div>
        <Switch
          checked={form.watch("isActive") ?? true}
          onCheckedChange={(checked) =>
            form.setValue("isActive", checked, { shouldDirty: true })
          }
        />
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
