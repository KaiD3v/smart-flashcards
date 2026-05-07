"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  PartyPopper,
  Pause,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Card, CardContent } from "@/components/ui/card";
import {
  CardCount,
  ReviewCard,
} from "@/features/flashcards/review-card";
import { PageContainer } from "@/components/common/page-container";
import {
  useFlashcardsNeedReview,
  useReviewFlashcard,
} from "@/hooks/use-flashcards";
import { useSubject } from "@/hooks/use-subjects";
import { useKeyboardShortcut } from "@/hooks/use-keyboard";
import { REVIEW_RATINGS, type Flashcard, type ReviewRating } from "@/types/api";
import { cn } from "@/lib/utils";

type Stats = Record<ReviewRating, number>;

const RATING_META: Record<
  ReviewRating,
  { label: string; description: string; key: string; className: string }
> = {
  again: {
    label: "Again",
    description: "I forgot",
    key: "1",
    className:
      "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
  },
  hard: {
    label: "Hard",
    description: "Took effort",
    key: "2",
    className:
      "border-warning/30 bg-warning/10 text-warning hover:bg-warning/15",
  },
  good: {
    label: "Good",
    description: "Got it",
    key: "3",
    className:
      "border-info/30 bg-info/10 text-info hover:bg-info/15",
  },
  easy: {
    label: "Easy",
    description: "Too easy",
    key: "4",
    className:
      "border-success/30 bg-success/10 text-success hover:bg-success/15",
  },
};

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const subjectQuery = useSubject(id);
  const dueQuery = useFlashcardsNeedReview(id);
  const review = useReviewFlashcard(id);

  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<Stats>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!hydrated && dueQuery.data) {
      setQueue(dueQuery.data);
      setHydrated(true);
    }
  }, [dueQuery.data, hydrated]);

  const current = queue[index];
  const total = queue.length;
  const isFinished = hydrated && total > 0 && index >= total;
  const isEmpty = hydrated && total === 0;

  const handleFlip = () => {
    if (!current || review.isPending) return;
    setFlipped((prev) => !prev);
  };

  const handleRate = async (rating: ReviewRating) => {
    if (!current || review.isPending) return;
    if (!flipped) {
      setFlipped(true);
      return;
    }
    try {
      await review.mutateAsync({ flashcardId: current.id, rating });
      setStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
      setFlipped(false);
      setIndex((prev) => prev + 1);
    } catch {
      // toast handled in mutation
    }
  };

  useKeyboardShortcut([" ", "Enter"], (event) => {
    event.preventDefault();
    handleFlip();
  });

  useKeyboardShortcut(["1"], () => {
    void handleRate("again");
  });
  useKeyboardShortcut(["2"], () => {
    void handleRate("hard");
  });
  useKeyboardShortcut(["3"], () => {
    void handleRate("good");
  });
  useKeyboardShortcut(["4"], () => {
    void handleRate("easy");
  });

  const totalReviewed = useMemo(
    () => Object.values(stats).reduce((sum, count) => sum + count, 0),
    [stats]
  );

  if (subjectQuery.isLoading || !hydrated) {
    return (
      <PageContainer size="md">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!subjectQuery.data) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <PageContainer size="md">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/subjects/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {subjectQuery.data.name}
        </Link>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span className="inline-flex items-center gap-1">
            <Kbd>Space</Kbd> flip
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>1</Kbd>–<Kbd>4</Kbd> rate
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FinishedCard
              title="Nothing to review right now"
              description="Come back later or add new cards to keep building your knowledge."
              icon={<Pause className="h-5 w-5" />}
              accent="info"
              actions={
                <>
                  <Button asChild variant="default">
                    <Link href={`/subjects/${id}`}>
                      <ArrowLeft />
                      Back to subject
                    </Link>
                  </Button>
                </>
              }
            />
          </motion.div>
        ) : isFinished ? (
          <motion.div
            key="finished"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FinishedCard
              title={`Session complete — ${totalReviewed} cards reviewed`}
              description="Your schedule has been updated. Strong work!"
              icon={<PartyPopper className="h-5 w-5" />}
              accent="success"
              actions={
                <>
                  <Button asChild variant="ghost">
                    <Link href={`/subjects/${id}`}>
                      <ArrowLeft />
                      Back to subject
                    </Link>
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={async () => {
                      const fresh = await dueQuery.refetch();
                      const next = fresh.data ?? [];
                      if (next.length === 0) {
                        toast.success("All clear", {
                          description: "Nothing else is due right now.",
                        });
                        return;
                      }
                      setQueue(next);
                      setIndex(0);
                      setStats({ again: 0, hard: 0, good: 0, easy: 0 });
                    }}
                  >
                    <RefreshCcw />
                    Reload due cards
                  </Button>
                </>
              }
              footer={<StatsRow stats={stats} />}
            />
          </motion.div>
        ) : current ? (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <CardCount current={index + 1} total={total} />
            <ReviewCard
              flashcard={current}
              flipped={flipped}
              onFlip={handleFlip}
            />

            <RatingsBar
              flipped={flipped}
              disabled={review.isPending}
              onFlip={handleFlip}
              onRate={handleRate}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageContainer>
  );
}

function RatingsBar({
  flipped,
  disabled,
  onFlip,
  onRate,
}: {
  flipped: boolean;
  disabled: boolean;
  onFlip: () => void;
  onRate: (rating: ReviewRating) => void;
}) {
  if (!flipped) {
    return (
      <div className="flex items-center justify-center">
        <Button
          variant="default"
          size="lg"
          onClick={onFlip}
          className="min-w-[14rem]"
        >
          Show answer
          <Kbd className="ml-1">Space</Kbd>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {REVIEW_RATINGS.map((rating) => {
        const meta = RATING_META[rating];
        return (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            onClick={() => onRate(rating)}
            className={cn(
              "group flex h-auto flex-col items-start gap-0.5 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-50",
              meta.className
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span>{meta.label}</span>
              <Kbd>{meta.key}</Kbd>
            </div>
            <span className="text-xs font-normal opacity-80">
              {meta.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FinishedCard({
  title,
  description,
  icon,
  accent,
  actions,
  footer,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: "success" | "info";
  actions: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            accent === "success"
              ? "bg-success/10 text-success"
              : "bg-info/10 text-info"
          )}
        >
          {icon}
        </span>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
        {footer}
      </CardContent>
    </Card>
  );
}

function StatsRow({ stats }: { stats: Stats }) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="mt-2 grid w-full max-w-md grid-cols-4 gap-2">
      {REVIEW_RATINGS.map((rating) => (
        <div
          key={rating}
          className={cn(
            "rounded-xl border px-2 py-2 text-center text-xs",
            RATING_META[rating].className
          )}
        >
          <div className="text-base font-semibold">{stats[rating]}</div>
          <div className="text-[11px] opacity-70">
            {RATING_META[rating].label}
          </div>
        </div>
      ))}
    </div>
  );
}
