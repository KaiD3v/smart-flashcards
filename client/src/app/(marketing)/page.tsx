import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Check,
  Keyboard,
  Layers,
  RefreshCcw,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="relative">
      <BackgroundDecor />

      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="default"
              className="mx-auto mb-6 inline-flex items-center gap-1.5 px-3 py-1 text-[11px]"
            >
              <Sparkles className="h-3 w-3" />
              AI-powered flashcards
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
              Study smarter with{" "}
              <span className="bg-[linear-gradient(135deg,oklch(0.55_0.21_280),oklch(0.62_0.22_330))] bg-clip-text text-transparent">
                AI flashcards
              </span>{" "}
              and spaced repetition.
            </h1>
            <p className="mt-5 text-pretty text-base text-muted-foreground sm:text-lg">
              Paste your notes and SmartFlashcards builds a focused deck for
              you. Then a science-backed FSRS engine schedules each review for
              maximum retention.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" variant="gradient">
                <Link href="/register">
                  Start Studying Smarter
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="ghost">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>

            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-success" />
              Free to start · No credit card · Dark mode included
            </p>
          </div>

          <HeroPreview />
        </div>
      </section>

      <Features />
      <HowItWorks />
      <Pricing />
      <Cta />
    </div>
  );
}

function BackgroundDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-radial-fade"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)] opacity-40"
      />
    </>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl">
      <div className="absolute -inset-x-6 -inset-y-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/14 via-transparent to-transparent blur-2xl" />
      <Card className="overflow-hidden border-border/80 shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-3 text-xs text-muted-foreground">
            smartflashcards.com / dashboard
          </span>
        </div>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-3">
          {[
            {
              title: "Cell Biology",
              cards: 42,
              due: 8,
              accent: "from-primary/15 to-transparent",
            },
            {
              title: "Microeconomics",
              cards: 28,
              due: 0,
              accent: "from-info/15 to-transparent",
            },
            {
              title: "World History",
              cards: 67,
              due: 12,
              accent: "from-success/15 to-transparent",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-5 ${item.accent}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                  <BookOpenCheck className="h-4 w-4" />
                </span>
                {item.due > 0 ? (
                  <Badge variant="info">{item.due} due</Badge>
                ) : null}
              </div>
              <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
              <p className="text-xs text-muted-foreground">
                {item.cards} cards · Last reviewed today
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const features = [
  {
    icon: Wand2,
    title: "AI deck generation",
    body: "Paste any text—lecture notes, articles, your own summary—and we&apos;ll generate a focused deck of flashcards in seconds.",
  },
  {
    icon: Brain,
    title: "FSRS spaced repetition",
    body: "We schedule each card with the FSRS algorithm so you spend time only on what your brain is about to forget.",
  },
  {
    icon: Layers,
    title: "Beautiful subject library",
    body: "Organize your decks by subject. Tabs separate all cards, the cards due today, and AI generation in one place.",
  },
  {
    icon: Keyboard,
    title: "Built for keyboard",
    body: "Flip with Space, rate with 1–4, jump anywhere with ⌘K. Designed for fast, distraction-free review sessions.",
  },
  {
    icon: RefreshCcw,
    title: "Optimistic UI",
    body: "Your edits land instantly. Background sync keeps the server in step without blocking your study flow.",
  },
  {
    icon: Zap,
    title: "Privacy & speed",
    body: "JWT-cookie auth, no third-party trackers. Modern, minimal interface inspired by Linear and Notion.",
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to learn faster
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            A focused workspace for AI-assisted studying. No clutter, no
            popups—just you and your knowledge gaps.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <Card
              key={title}
              className="group h-full p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p
                className="mt-1.5 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Create a subject",
      body: "Group decks by topic—Cell Biology, Spanish vocabulary, exam prep.",
    },
    {
      title: "Generate or write cards",
      body: "Drop notes into the AI panel or write your own. Mix both freely.",
    },
    {
      title: "Review what's due",
      body: "FSRS picks the perfect interval. Show up daily, retain forever.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From notes to mastery in three steps
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Free while we build the MVP
        </h2>
        <p className="mt-3 text-muted-foreground">
          The full app is free during the public preview. Bring your own
          backend, or self-host the whole stack.
        </p>
        <Button asChild size="xl" variant="gradient" className="mt-8">
          <Link href="/register">
            Create your account
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="border-t border-border/60 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h3 className="text-2xl font-semibold tracking-tight">
          Ready to remember everything?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Join SmartFlashcards and replace cramming with calm, daily reviews.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="gradient" size="lg">
            <Link href="/register">Start studying</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
