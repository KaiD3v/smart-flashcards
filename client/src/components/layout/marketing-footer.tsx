import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { env } from "@/lib/env";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <Logo />
            <p className="max-w-md text-sm text-muted-foreground">
              Study smarter with AI-generated flashcards and a science-backed
              spaced repetition engine.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Create account
            </Link>
            <a
              href="#features"
              className="hover:text-foreground"
            >
              Features
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {env.siteName}. Crafted for focused learners.
        </p>
      </div>
    </footer>
  );
}
