"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Layers,
  ListChecks,
  Pencil,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageContainer,
  PageHeader,
} from "@/components/common/page-container";
import { StatsCard } from "@/components/common/stats-card";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateFlashcardDialog } from "@/features/flashcards/create-flashcard-dialog";
import { FlashcardListItem } from "@/features/flashcards/flashcard-list-item";
import { AiGenerationPanel } from "@/features/flashcards/ai-generation-panel";
import { FlashcardListSkeleton } from "@/features/flashcards/skeletons";
import { EditSubjectDialog } from "@/features/subjects/edit-subject-dialog";
import {
  useFlashcards,
  useFlashcardsNeedReview,
} from "@/hooks/use-flashcards";
import { useDeleteSubject, useSubject } from "@/hooks/use-subjects";
import { formatRelative } from "@/lib/utils";

type TabKey = "all" | "review" | "generate";

const VALID_TABS: TabKey[] = ["all", "review", "generate"];

export default function SubjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = useMemo<TabKey>(() => {
    const tab = searchParams.get("tab") as TabKey | null;
    return tab && VALID_TABS.includes(tab) ? tab : "all";
  }, [searchParams]);

  const [tab, setTab] = useState<TabKey>(initialTab);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const subjectQuery = useSubject(id);
  const flashcardsQuery = useFlashcards(id);
  const dueQuery = useFlashcardsNeedReview(id);
  const deleteSubject = useDeleteSubject();

  const subject = subjectQuery.data;
  const flashcards = flashcardsQuery.data;
  const dueCards = dueQuery.data;

  const filteredCards = useMemo(() => {
    if (!flashcards) return [];
    const term = query.trim().toLowerCase();
    if (!term) return flashcards;
    return flashcards.filter(
      (card) =>
        card.front.toLowerCase().includes(term) ||
        card.back.toLowerCase().includes(term)
    );
  }, [flashcards, query]);

  const isLoading = subjectQuery.isLoading;

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-72" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="mt-8">
          <FlashcardListSkeleton />
        </div>
      </PageContainer>
    );
  }

  if (!subject) {
    return (
      <PageContainer>
        <EmptyState
          icon={<BookOpen className="h-5 w-5" />}
          title="Subject not found"
          description="This subject may have been deleted or you no longer have access."
          action={
            <Button asChild variant="default">
              <Link href="/dashboard">
                <ArrowLeft />
                Back to dashboard
              </Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const totalCards = flashcards?.length ?? 0;
  const dueCount = dueCards?.length ?? 0;
  const newCount =
    flashcards?.filter((card) => card.state === 0).length ?? 0;

  const handleTabChange = (next: string) => {
    setTab(next as TabKey);
    const url = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      url.delete("tab");
    } else {
      url.set("tab", next);
    }
    const target = url.size > 0 ? `?${url.toString()}` : "";
    router.replace(`/subjects/${id}${target}`, { scroll: false });
  };

  return (
    <PageContainer>
      <Link
        href="/dashboard"
        className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All subjects
      </Link>

      <PageHeader
        title={subject.name}
        description={subject.description ?? "No description yet."}
        actions={
          <>
            <Button
              asChild
              variant={dueCount > 0 ? "gradient" : "outline"}
              disabled={dueCount === 0}
            >
              <Link href={`/subjects/${subject.id}/review`}>
                <Play />
                Start review {dueCount > 0 ? `· ${dueCount}` : ""}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Subject actions">
                  <Pencil />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                  Edit subject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete subject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={subject.isActive ? "success" : "secondary"}>
          {subject.isActive ? "Active" : "Inactive"}
        </Badge>
        <span>Updated {formatRelative(subject.updatedAt)}</span>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsCard
          label="Total cards"
          value={totalCards}
          icon={<Layers className="h-4 w-4" />}
        />
        <StatsCard
          label="Due now"
          value={dueCount}
          accent={dueCount > 0 ? "warning" : "success"}
          icon={<ListChecks className="h-4 w-4" />}
        />
        <StatsCard
          label="New cards"
          value={newCount}
          accent="info"
          icon={<GraduationCap className="h-4 w-4" />}
        />
      </section>

      <Tabs
        value={tab}
        onValueChange={handleTabChange}
        className="mt-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">
              <Layers className="h-3.5 w-3.5" />
              All cards
            </TabsTrigger>
            <TabsTrigger value="review">
              <ListChecks className="h-3.5 w-3.5" />
              Need review
              {dueCount > 0 ? (
                <Badge variant="info" className="ml-1">
                  {dueCount}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="generate">
              <Sparkles className="h-3.5 w-3.5" />
              Generate with AI
            </TabsTrigger>
          </TabsList>

          {tab !== "generate" ? (
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cards…"
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <CreateFlashcardDialog
                subjectId={subject.id}
                trigger={
                  <Button variant="default">
                    <Plus />
                    Add card
                  </Button>
                }
              />
            </div>
          ) : null}
        </div>

        <TabsContent value="all">
          {flashcardsQuery.isLoading ? (
            <FlashcardListSkeleton />
          ) : !flashcards || flashcards.length === 0 ? (
            <EmptyState
              icon={<Layers className="h-5 w-5" />}
              title="No flashcards yet"
              description="Create your first card or use AI to generate a deck from your notes."
              action={
                <div className="flex gap-2">
                  <CreateFlashcardDialog
                    subjectId={subject.id}
                    trigger={
                      <Button variant="default">
                        <Plus />
                        Add card
                      </Button>
                    }
                  />
                  <Button
                    variant="gradient"
                    onClick={() => handleTabChange("generate")}
                  >
                    <Sparkles />
                    Generate with AI
                  </Button>
                </div>
              }
            />
          ) : filteredCards.length === 0 ? (
            <EmptyState
              icon={<Search className="h-5 w-5" />}
              title="No matches"
              description={`No card matches "${query}"`}
              action={
                <Button variant="ghost" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredCards.map((card, index) => (
                <FlashcardListItem
                  key={card.id}
                  flashcard={card}
                  index={index}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="review">
          {dueQuery.isLoading ? (
            <FlashcardListSkeleton count={3} />
          ) : !dueCards || dueCards.length === 0 ? (
            <EmptyState
              icon={<ListChecks className="h-5 w-5" />}
              title="You're all caught up"
              description="No cards are due right now. Come back later or add new ones."
              action={
                <CreateFlashcardDialog
                  subjectId={subject.id}
                  trigger={
                    <Button variant="default">
                      <Plus />
                      Add card
                    </Button>
                  }
                />
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-br from-primary/8 to-transparent px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {dueCount} card{dueCount === 1 ? "" : "s"} ready
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Start a focused review session below.
                  </p>
                </div>
                <Button asChild variant="gradient">
                  <Link href={`/subjects/${subject.id}/review`}>
                    <Play />
                    Start session
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {dueCards.map((card, index) => (
                  <FlashcardListItem
                    key={card.id}
                    flashcard={card}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate">
          <AiGenerationPanel subjectId={subject.id} />
        </TabsContent>
      </Tabs>

      <EditSubjectDialog
        subject={subject}
        open={editing}
        onOpenChange={setEditing}
      />
      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title={`Delete "${subject.name}"?`}
        description="This will permanently delete the subject and all its flashcards. This action cannot be undone."
        confirmLabel="Delete subject"
        destructive
        onConfirm={async () => {
          await deleteSubject.mutateAsync(subject.id);
          router.replace("/dashboard");
        }}
      />
    </PageContainer>
  );
}
