import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <Logo />
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Page not found</h2>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for has been moved, deleted, or never
            existed.
          </p>
        </div>
        <Button asChild variant="gradient" size="lg">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
