import type { Metadata } from "next";
import Link from "next/link";
import { getPagesByCluster } from "@/content/seo/registry";
import type { SeoCluster } from "@/content/seo/types";
import { CLUSTER_LABELS } from "@/lib/seo/constants";
import { BackgroundDecor } from "@/components/marketing/background-decor";

export const metadata: Metadata = {
  title: "Study guides & learning resources",
  description:
    "Free guides on AI flashcards, spaced repetition, active recall, exam prep, medical school study, and Anki alternatives from SmartFlashcards.",
};

const CLUSTER_ORDER: SeoCluster[] = [
  "ai-study-tools",
  "pdf-to-flashcards",
  "anki-alternative",
  "spaced-repetition",
  "active-recall",
  "exam-preparation",
  "medical-students",
  "productivity",
];

export default function GuidesPage() {
  return (
    <div className="relative">
      <BackgroundDecor />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Study guides & resources
          </h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Explore in-depth guides on AI flashcards, spaced repetition, exam
            preparation, and smarter study habits—written for students in the
            US, Canada, UK, and Australia.
          </p>
        </header>

        <div className="mt-16 space-y-14">
          {CLUSTER_ORDER.map((cluster) => {
            const pages = getPagesByCluster(cluster);
            return (
              <section key={cluster} id={cluster}>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {CLUSTER_LABELS[cluster]}
                </h2>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {pages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={`/${page.slug}`}
                        className="block rounded-xl border border-border/80 bg-card/40 px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-accent/50"
                      >
                        {page.h1}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
