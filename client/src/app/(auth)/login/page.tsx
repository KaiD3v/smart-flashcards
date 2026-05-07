import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Card className="border-border/80">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue studying.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
