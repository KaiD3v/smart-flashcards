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
import { useCreateFlashcard } from "@/hooks/use-flashcards";
import { FlashcardForm } from "./flashcard-form";

export function CreateFlashcardDialog({
  subjectId,
  trigger,
}: {
  subjectId: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const create = useCreateFlashcard(subjectId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New flashcard</DialogTitle>
          <DialogDescription>
            Create a question with the answer on the back. The card will start
            in the &ldquo;new&rdquo; review state.
          </DialogDescription>
        </DialogHeader>
        <FlashcardForm
          submitLabel="Create flashcard"
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await create.mutateAsync(values);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
