"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateFlashcard } from "@/hooks/use-flashcards";
import type { Flashcard } from "@/types/api";
import { FlashcardForm } from "./flashcard-form";

export function EditFlashcardDialog({
  flashcard,
  open,
  onOpenChange,
}: {
  flashcard: Flashcard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateFlashcard(flashcard.subjectId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit flashcard</DialogTitle>
          <DialogDescription>
            Update the question or answer. Review history is preserved.
          </DialogDescription>
        </DialogHeader>
        <FlashcardForm
          defaultValues={{ front: flashcard.front, back: flashcard.back }}
          submitLabel="Save changes"
          onCancel={() => onOpenChange(false)}
          onSubmit={async (values) => {
            await update.mutateAsync({
              flashcardId: flashcard.id,
              payload: values,
            });
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
