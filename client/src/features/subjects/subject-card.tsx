"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative, truncate } from "@/lib/utils";
import type { Subject } from "@/types/api";

interface SubjectCardProps {
  subject: Subject;
  flashcardCount?: number;
  pendingReview?: number;
  index?: number;
}

export function SubjectCard({
  subject,
  flashcardCount,
  pendingReview,
  index = 0,
}: SubjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      className="h-full"
    >
      <Link href={`/subjects/${subject.id}`} className="block h-full">
        <Card className="group relative h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <CardContent className="flex h-full flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpenCheck className="h-4 w-4" />
              </div>
              {subject.isActive ? null : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-semibold tracking-tight text-balance">
                {subject.name}
              </h3>
              {subject.description ? (
                <p className="text-sm text-muted-foreground text-pretty">
                  {truncate(subject.description, 130)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description yet.
                </p>
              )}
            </div>

            <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
              {typeof flashcardCount === "number" ? (
                <Badge variant="outline" className="font-normal">
                  {flashcardCount} cards
                </Badge>
              ) : null}
              {typeof pendingReview === "number" && pendingReview > 0 ? (
                <Badge variant="info">{pendingReview} due</Badge>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
            <span>Updated {formatRelative(subject.updatedAt)}</span>
            <span className="inline-flex items-center gap-1 text-foreground/80 transition-transform group-hover:translate-x-0.5">
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
