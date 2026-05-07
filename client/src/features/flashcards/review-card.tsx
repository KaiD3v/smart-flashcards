"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/types/api";

interface ReviewCardProps {
  flashcard: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}

export function ReviewCard({ flashcard, flipped, onFlip }: ReviewCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="group relative w-full text-left"
      style={{ perspective: "1400px" }}
      aria-label="Flip flashcard"
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <FaceCard side="front" hidden={flipped}>
          <FaceContent
            label="Question"
            text={flashcard.front}
            hint="Click or press Space to reveal the answer"
          />
        </FaceCard>
        <FaceCard side="back" hidden={!flipped} rotated>
          <FaceContent label="Answer" text={flashcard.back} />
        </FaceCard>
      </motion.div>
    </button>
  );
}

function FaceCard({
  side,
  hidden,
  rotated,
  children,
}: {
  side: "front" | "back";
  hidden: boolean;
  rotated?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "relative flex min-h-[320px] w-full flex-col items-center justify-center overflow-hidden p-8 sm:min-h-[360px] sm:p-12",
        side === "back" && "absolute inset-0",
        rotated && "[transform:rotateY(180deg)]"
      )}
      style={{ backfaceVisibility: "hidden" }}
      aria-hidden={hidden}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-60",
          side === "front"
            ? "bg-[radial-gradient(circle_at_top,oklch(0.55_0.21_280/0.12),transparent_60%)]"
            : "bg-[radial-gradient(circle_at_bottom,oklch(0.62_0.22_330/0.16),transparent_60%)]"
        )}
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 text-center">
        {children}
      </div>
    </Card>
  );
}

function FaceContent({
  label,
  text,
  hint,
}: {
  label: string;
  text: string;
  hint?: string;
}) {
  return (
    <>
      <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <p className="max-w-2xl text-balance text-xl font-medium leading-snug text-foreground sm:text-2xl">
        {text}
      </p>
      {hint ? (
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {hint}
        </span>
      ) : null}
    </>
  );
}

export function CardCount({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const [pulse] = useState<boolean>(false);
  const progress = total === 0 ? 0 : Math.min((current / total) * 100, 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Card {Math.min(current, total)} of {total}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full bg-primary", pulse && "animate-pulse")}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        />
      </div>
    </div>
  );
}
