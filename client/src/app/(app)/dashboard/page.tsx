"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpenCheck,
  ListChecks,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PageContainer,
  PageHeader,
} from "@/components/common/page-container";
import { StatsCard } from "@/components/common/stats-card";
import { EmptyState } from "@/components/common/empty-state";
import { SubjectCard } from "@/features/subjects/subject-card";
import { CreateSubjectDialog } from "@/features/subjects/create-subject-dialog";
import { SubjectGridSkeleton } from "@/features/flashcards/skeletons";
import { useAuth } from "@/providers/auth-provider";
import { useSubjects } from "@/hooks/use-subjects";

export default function DashboardPage() {
  const { user } = useAuth();
  const { subjects, isLoading } = useSubjects();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "create-subject") {
      setCreateOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      router.replace(
        params.size > 0 ? `/dashboard?${params.toString()}` : "/dashboard",
        { scroll: false }
      );
    }
  }, [searchParams, router]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const filtered = useMemo(() => {
    if (!subjects) return [];
    const lower = query.trim().toLowerCase();
    if (!lower) return subjects;
    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(lower) ||
        subject.description?.toLowerCase().includes(lower)
    );
  }, [subjects, query]);

  const totalSubjects = subjects?.length ?? 0;
  const activeSubjects = subjects?.filter((s) => s.isActive).length ?? 0;

  return (
    <PageContainer>
      <PageHeader
        title={
          <>
            {greeting}
            {user?.name || user?.nickname ? (
              <>
                ,{" "}
                <span className="bg-[linear-gradient(135deg,oklch(0.55_0.21_280),oklch(0.62_0.22_330))] bg-clip-text text-transparent">
                  {user?.name?.split(" ")[0] ?? user?.nickname}
                </span>
              </>
            ) : null}
          </>
        }
        description="Pick a subject to study, or generate a new deck with AI."
        actions={
          <CreateSubjectDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button variant="gradient" size="lg">
                <Plus />
                New subject
              </Button>
            }
          />
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          label="Subjects"
          value={totalSubjects}
          hint={`${activeSubjects} active`}
          icon={<BookOpenCheck className="h-4 w-4" />}
        />
        <StatsCard
          label="Generation"
          value="AI ready"
          hint="Paste any text to build a deck"
          accent="info"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatsCard
          label="Spaced repetition"
          value="FSRS"
          hint="Optimized review intervals"
          accent="success"
          icon={<ListChecks className="h-4 w-4" />}
        />
      </section>

      <section className="mt-10 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Your subjects</h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search subjects…"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <SubjectGridSkeleton />
        ) : !subjects || subjects.length === 0 ? (
          <EmptyState
            icon={<BookOpenCheck className="h-5 w-5" />}
            title="No subjects yet"
            description="Create your first subject to start adding flashcards or generate a deck with AI."
            action={
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setCreateOpen(true)}
              >
                <Plus />
                Create subject
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="h-5 w-5" />}
            title="No matches"
            description={`No subject matches "${query.trim()}". Try a different search.`}
            action={
              <Button variant="ghost" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
