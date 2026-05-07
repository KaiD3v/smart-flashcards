"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";
import { normalizeError } from "@/lib/api/error";
import { registerSchema, type RegisterValues } from "./auth-schemas";

export function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      nickname: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      const user = await authService.register({
        ...values,
        name: values.name ?? undefined,
      });
      setUser(user);
      toast.success("Account created", {
        description: `Welcome aboard, ${user.nickname}!`,
      });
      router.replace("/dashboard");
    } catch (error) {
      const normalized = normalizeError(error);
      const lower = normalized.message.toLowerCase();
      if (lower.includes("email")) {
        form.setError("email", { message: normalized.message });
      } else if (lower.includes("nickname")) {
        form.setError("nickname", { message: normalized.message });
      } else {
        form.setError("password", { message: normalized.message });
      }
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">
            Name <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            {...form.register("name")}
          />
          {form.formState.errors.name ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            autoComplete="username"
            placeholder="ada_l"
            aria-invalid={Boolean(form.formState.errors.nickname)}
            {...form.register("nickname")}
          />
          {form.formState.errors.nickname ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.nickname.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={Boolean(form.formState.errors.password)}
            className="pr-10"
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <Loader2 className="animate-spin" />
        ) : null}
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
