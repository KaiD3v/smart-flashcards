import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function RegisterPage() {
  return (
    <Card className="border-border/80">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Start building your AI flashcard library in seconds.
          </p>
        </div>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
