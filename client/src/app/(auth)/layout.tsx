import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-radial-fade opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <div className="flex w-full flex-col">
        <header className="flex items-center justify-between p-4 sm:p-6">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back home
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-4 pb-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
