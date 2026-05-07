"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateSubject } from "@/hooks/use-subjects";
import { SubjectForm } from "./subject-form";

interface CreateSubjectDialogProps {
  trigger: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateSubjectDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateSubjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (value: boolean) => {
    onOpenChange?.(value);
    if (controlledOpen === undefined) setInternalOpen(value);
  };

  const create = useCreateSubject();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a subject</DialogTitle>
          <DialogDescription>
            Subjects keep your flashcards organized by topic.
          </DialogDescription>
        </DialogHeader>
        <SubjectForm
          submitLabel="Create subject"
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await create.mutateAsync({
              name: values.name,
              description: values.description?.trim() || undefined,
              imageUrl: values.imageUrl?.trim() || undefined,
              isActive: values.isActive,
            });
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
