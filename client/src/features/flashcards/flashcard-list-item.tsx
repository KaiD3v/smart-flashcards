"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EditFlashcardDialog } from "./edit-flashcard-dialog";
import { useDeleteFlashcard } from "@/hooks/use-flashcards";
import { formatRelative } from "@/lib/utils";
import { FSRS_STATE_LABEL, type Flashcard } from "@/types/api";

interface FlashcardListItemProps {
  flashcard: Flashcard;
  index?: number;
}

export function FlashcardListItem({
  flashcard,
  index = 0,
}: FlashcardListItemProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useDeleteFlashcard(flashcard.subjectId);

  const stateLabel = FSRS_STATE_LABEL[flashcard.state] ?? "New";
  const isDue = new Date(flashcard.due).getTime() <= Date.now();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
    >
      <Card className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isDue ? "info" : "secondary"}>{stateLabel}</Badge>
            <span className="text-xs text-muted-foreground">
              Due {formatRelative(flashcard.due)}
            </span>
            {flashcard.lastReviewedAt ? (
              <span className="text-xs text-muted-foreground">
                · Reviewed {formatRelative(flashcard.lastReviewedAt)}
              </span>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium leading-snug text-foreground text-pretty">
              {flashcard.front}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              {flashcard.back}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground"
              aria-label="Actions"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setConfirmDelete(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      <EditFlashcardDialog
        flashcard={flashcard}
        open={editing}
        onOpenChange={setEditing}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this flashcard?"
        description="This cannot be undone. The card and its review history will be lost."
        confirmLabel="Delete"
        destructive
        onConfirm={() => remove.mutateAsync(flashcard.id)}
      />
    </motion.div>
  );
}
