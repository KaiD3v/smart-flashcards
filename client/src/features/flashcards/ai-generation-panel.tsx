"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Cpu,
  Loader2,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  generateFlashcardsSchema,
  type GenerateFlashcardsValues,
} from "./flashcard-schemas";
import {
  useCreateFlashcard,
  useGenerateFlashcards,
} from "@/hooks/use-flashcards";
import type { GeneratedFlashcardDraft } from "@/types/api";

const PROGRESS_MESSAGES = [
  "Reading your material…",
  "Identifying key concepts…",
  "Drafting questions and answers…",
  "Polishing the deck…",
];

export function AiGenerationPanel({ subjectId }: { subjectId: string }) {
  const generate = useGenerateFlashcards(subjectId);
  const create = useCreateFlashcard(subjectId);
  const [drafts, setDrafts] = useState<GeneratedFlashcardDraft[] | null>(null);
  const [progressIndex, setProgressIndex] = useState(0);

  const form = useForm<GenerateFlashcardsValues>({
    resolver: zodResolver(generateFlashcardsSchema),
    defaultValues: {
      materialText: "",
      maxCards: 8,
      persist: false,
      model: "",
    },
  });

  async function onSubmit(values: GenerateFlashcardsValues) {
    setDrafts(null);
    setProgressIndex(0);
    const interval = window.setInterval(() => {
      setProgressIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    try {
      const result = await generate.mutateAsync({
        materialText: values.materialText,
        maxCards: values.maxCards,
        model: values.model,
        persist: values.persist,
      });

      if (result.persisted) {
        toast.success(`Saved ${result.flashcards.length} flashcards`, {
          description: "They are now part of this subject.",
        });
        setDrafts(null);
      } else {
        setDrafts(result.flashcards);
        toast.success(`Generated ${result.flashcards.length} flashcards`, {
          description: "Review and save the ones you like.",
        });
      }
    } finally {
      window.clearInterval(interval);
    }
  }

  async function saveAllDrafts() {
    if (!drafts) return;
    let saved = 0;
    for (const draft of drafts) {
      try {
        await create.mutateAsync(draft);
        saved += 1;
      } catch {
        // toast already handled inside the mutation hook
      }
    }
    if (saved > 0) {
      toast.success(`Saved ${saved} flashcard${saved === 1 ? "" : "s"}`);
      setDrafts(null);
      form.reset({ ...form.getValues(), materialText: "" });
    }
  }

  async function saveOneDraft(draft: GeneratedFlashcardDraft, index: number) {
    await create.mutateAsync(draft);
    setDrafts((prev) => prev?.filter((_, i) => i !== index) ?? null);
  }

  const isGenerating = generate.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <Card className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold">Generate with AI</h3>
              <p className="text-xs text-muted-foreground">
                Paste study material and we&apos;ll craft flashcards for you.
              </p>
            </div>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="materialText">Study material</Label>
              <Textarea
                id="materialText"
                rows={10}
                placeholder="Paste lecture notes, textbook excerpts, or your own summary…"
                aria-invalid={Boolean(form.formState.errors.materialText)}
                {...form.register("materialText")}
              />
              {form.formState.errors.materialText ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.materialText.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="maxCards">Cards to generate</Label>
                <Input
                  id="maxCards"
                  type="number"
                  min={1}
                  max={50}
                  {...form.register("maxCards")}
                />
                {form.formState.errors.maxCards ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.maxCards.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="model">
                  Model{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="model"
                  placeholder="llama3.2"
                  {...form.register("model")}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Save automatically</p>
                <p className="text-xs text-muted-foreground">
                  When off, you&apos;ll review drafts before saving.
                </p>
              </div>
              <Switch
                checked={form.watch("persist") ?? false}
                onCheckedChange={(checked) =>
                  form.setValue("persist", checked, { shouldDirty: true })
                }
              />
            </div>

            <Button
              type="submit"
              size="lg"
              variant="gradient"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Wand2 />
              )}
              {isGenerating ? "Generating…" : "Generate flashcards"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Preview</h3>
            {drafts && drafts.length > 0 ? (
              <Badge variant="info">{drafts.length} drafts</Badge>
            ) : null}
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-primary/8 to-transparent text-center"
              >
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Cpu className="h-5 w-5 animate-pulse" />
                  <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {PROGRESS_MESSAGES[progressIndex] ??
                      PROGRESS_MESSAGES[PROGRESS_MESSAGES.length - 1]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AI generation may take a few seconds.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {PROGRESS_MESSAGES.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition-colors ${
                        i <= progressIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : drafts && drafts.length > 0 ? (
              <motion.div
                key="drafts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin"
              >
                {drafts.map((draft, index) => (
                  <DraftCard
                    key={`${draft.front}-${index}`}
                    draft={draft}
                    onSave={() => saveOneDraft(draft, index)}
                    onDiscard={() =>
                      setDrafts(
                        (prev) => prev?.filter((_, i) => i !== index) ?? null
                      )
                    }
                  />
                ))}
                <div className="sticky bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-card to-transparent pt-3">
                  <Button
                    variant="ghost"
                    onClick={() => setDrafts(null)}
                    disabled={create.isPending}
                  >
                    Clear all
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={saveAllDrafts}
                    disabled={create.isPending}
                  >
                    {create.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save all
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 text-center text-muted-foreground"
              >
                <Sparkles className="h-6 w-6" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    No previews yet
                  </p>
                  <p className="text-xs">
                    Generated drafts will appear here for review.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

function DraftCard({
  draft,
  onSave,
  onDiscard,
}: {
  draft: GeneratedFlashcardDraft;
  onSave: () => Promise<void>;
  onDiscard: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-xl border border-border bg-background/40 p-4"
    >
      <p className="text-sm font-medium leading-snug">{draft.front}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {draft.back}
      </p>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={async () => {
            try {
              setSaving(true);
              await onSave();
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin" /> : <Check />}
          Save
        </Button>
      </div>
    </motion.div>
  );
}
