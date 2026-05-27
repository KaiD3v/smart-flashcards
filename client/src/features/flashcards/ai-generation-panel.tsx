"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Cpu,
  FileText,
  Loader2,
  Save,
  Sparkles,
  Upload,
  Wand2,
  X,
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
  useGenerateFlashcardsFromFile,
} from "@/hooks/use-flashcards";
import type { GeneratedFlashcardDraft, GenerationResult, GenerationSource } from "@/types/api";

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.txt";

const PROGRESS_MESSAGES = [
  "Reading your material…",
  "Identifying key concepts…",
  "Drafting questions and answers…",
  "Polishing the deck…",
];

const FILE_PROGRESS_MESSAGES = [
  "Extracting text from document…",
  ...PROGRESS_MESSAGES.slice(1),
];

export function AiGenerationPanel({ subjectId }: { subjectId: string }) {
  const generate = useGenerateFlashcards(subjectId);
  const generateFromFile = useGenerateFlashcardsFromFile(subjectId);
  const create = useCreateFlashcard(subjectId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<GeneratedFlashcardDraft[] | null>(null);
  const [progressIndex, setProgressIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastSource, setLastSource] = useState<GenerationSource | null>(null);

  const form = useForm<GenerateFlashcardsValues>({
    resolver: zodResolver(generateFlashcardsSchema),
    defaultValues: {
      materialText: "",
      maxCards: 8,
      persist: false,
      model: "",
    },
  });

  async function handleGenerationResult(result: GenerationResult) {
    setLastSource(result.source ?? null);

    if (result.persisted) {
      toast.success(`Saved ${result.flashcards.length} flashcards`, {
        description: "They are now part of this subject.",
      });
      setDrafts(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setDrafts(result.flashcards);
      toast.success(`Generated ${result.flashcards.length} flashcards`, {
        description: result.source?.truncated
          ? "Some text was truncated before generation."
          : "Review and save the ones you like.",
      });
    }
  }

  async function runWithProgress(fromFile: boolean, task: () => Promise<GenerationResult>) {
    setDrafts(null);
    setProgressIndex(0);
    setLastSource(null);
    const messages = fromFile ? FILE_PROGRESS_MESSAGES : PROGRESS_MESSAGES;
    const interval = window.setInterval(() => {
      setProgressIndex((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const result = await task();
      await handleGenerationResult(result);
    } finally {
      window.clearInterval(interval);
    }
  }

  async function onSubmitText(values: GenerateFlashcardsValues) {
    await runWithProgress(false, () =>
      generate.mutateAsync({
        materialText: values.materialText,
        maxCards: values.maxCards,
        model: values.model,
        persist: values.persist,
      })
    );
  }

  async function onSubmitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = form.getValues();

    if (selectedFile) {
      await runWithProgress(true, () =>
        generateFromFile.mutateAsync({
          file: selectedFile,
          maxCards: values.maxCards,
          model: values.model,
          persist: values.persist,
        })
      );
      return;
    }

    await form.handleSubmit(onSubmitText)();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setLastSource(null);
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    setLastSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      clearSelectedFile();
    }
  }

  async function saveOneDraft(draft: GeneratedFlashcardDraft, index: number) {
    await create.mutateAsync(draft);
    setDrafts((prev) => prev?.filter((_, i) => i !== index) ?? null);
  }

  const isGenerating = generate.isPending || generateFromFile.isPending;
  const progressMessages = selectedFile ? FILE_PROGRESS_MESSAGES : PROGRESS_MESSAGES;

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
                Upload a PDF, Word (.docx), or text file — or paste material below.
              </p>
            </div>
          </div>

          <form
            onSubmit={onSubmitForm}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="documentFile">Document upload</Label>
              <div className="flex flex-col gap-2 rounded-xl border border-border px-3 py-3">
                <input
                  ref={fileInputRef}
                  id="documentFile"
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isGenerating}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-sm">{selectedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={clearSelectedFile}
                      disabled={isGenerating}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                  >
                    <Upload className="h-4 w-4" />
                    Choose PDF, DOCX, or TXT
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="materialText">
                Study material{" "}
                <span className="text-muted-foreground">
                  {selectedFile ? "(optional when a file is selected)" : ""}
                </span>
              </Label>
              <Textarea
                id="materialText"
                rows={10}
                placeholder="Paste lecture notes, textbook excerpts, or your own summary…"
                aria-invalid={Boolean(form.formState.errors.materialText)}
                disabled={Boolean(selectedFile)}
                {...form.register("materialText")}
              />
              {form.formState.errors.materialText && !selectedFile ? (
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
              {isGenerating
                ? "Generating…"
                : selectedFile
                  ? "Generate from file"
                  : "Generate flashcards"}
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

          {lastSource?.truncated ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              Text from <span className="font-medium">{lastSource.filename}</span> was
              truncated to {lastSource.extractedCharCount.toLocaleString()} characters
              (original: {lastSource.originalCharCount.toLocaleString()}).
            </p>
          ) : null}

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
                    {progressMessages[progressIndex] ??
                      progressMessages[progressMessages.length - 1]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AI generation may take a few seconds.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {progressMessages.map((_, i) => (
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
