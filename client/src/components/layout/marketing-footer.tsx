import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { env } from "@/lib/env";

const resourceLinks = [
  { href: "/ai-flashcard-generator", label: "AI flashcard generator" },
  { href: "/pdf-to-flashcards", label: "PDF to flashcards" },
  { href: "/anki-alternative", label: "Anki alternative" },
  { href: "/spaced-repetition", label: "Spaced repetition" },
  { href: "/active-recall", label: "Active recall" },
  { href: "/flashcards-for-exams", label: "Exam flashcards" },
  { href: "/flashcards-for-medical-school", label: "Medical school" },
  { href: "/guides", label: "All guides" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Logo />
            <p className="max-w-md text-sm text-muted-foreground">
              Study smarter with AI-generated flashcards and a science-backed
              spaced repetition engine.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Resources</h2>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {resourceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Account</h2>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/register" className="hover:text-foreground">
                Create account
              </Link>
              <Link href="/login" className="hover:text-foreground">
                Sign in
              </Link>
              <Link href="/#features" className="hover:text-foreground">
                Features
              </Link>
            </nav>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {env.siteName}. Crafted for focused learners.
        </p>
      </div>
    </footer>
  );
}
