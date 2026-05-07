"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateSubject } from "@/hooks/use-subjects";
import type { Subject } from "@/types/api";
import { SubjectForm } from "./subject-form";

interface EditSubjectDialogProps {
  subject: Subject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubjectDialog({
  subject,
  open,
  onOpenChange,
}: EditSubjectDialogProps) {
  const update = useUpdateSubject(subject.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit subject</DialogTitle>
          <DialogDescription>
            Update name, description, or visibility.
          </DialogDescription>
        </DialogHeader>
        <SubjectForm
          submitLabel="Save changes"
          defaultValues={{
            name: subject.name,
            description: subject.description ?? "",
            imageUrl: subject.imageUrl ?? "",
            isActive: subject.isActive,
          }}
          onCancel={() => onOpenChange(false)}
          onSubmit={async (values) => {
            await update.mutateAsync({
              name: values.name,
              description: values.description?.trim()
                ? values.description.trim()
                : null,
              imageUrl: values.imageUrl?.trim() ? values.imageUrl.trim() : null,
              isActive: values.isActive,
            });
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
