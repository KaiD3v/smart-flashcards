"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogOut, Save, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PageContainer,
  PageHeader,
} from "@/components/common/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { usersService } from "@/services/users.service";
import { normalizeError } from "@/lib/api/error";
import {
  profileSchema,
  type ProfileValues,
} from "@/features/auth/auth-schemas";
import { formatDate, getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const { user, setUser, signOut } = useAuth();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      nickname: user?.nickname ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        nickname: user.nickname,
      });
    }
  }, [user, form]);

  if (!user) {
    return null;
  }

  async function onSubmit(values: ProfileValues) {
    if (!user) return;
    try {
      const updated = await usersService.update(user.id, {
        name: values.name,
        nickname: values.nickname,
      });
      setUser(updated);
      toast.success("Profile updated");
    } catch (error) {
      const normalized = normalizeError(error);
      const lower = normalized.message.toLowerCase();
      if (lower.includes("nickname")) {
        form.setError("nickname", { message: normalized.message });
      } else {
        toast.error("Could not update profile", {
          description: normalized.message,
        });
      }
    }
  }

  return (
    <PageContainer size="md">
      <PageHeader
        title="Settings"
        description="Manage your profile and account preferences."
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-base">
                {getInitials(user.name, user.nickname)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {user.name ?? user.nickname}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold">Profile</h2>
                <p className="text-xs text-muted-foreground">
                  Update how you appear in SmartFlashcards.
                </p>
              </div>
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 sm:grid-cols-2"
              noValidate
            >
              <div className="flex flex-col gap-2 sm:col-span-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  {...form.register("name")}
                />
                {form.formState.errors.name ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:col-span-1">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  placeholder="your_handle"
                  aria-invalid={Boolean(form.formState.errors.nickname)}
                  {...form.register("nickname")}
                />
                {form.formState.errors.nickname ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.nickname.message}
                  </p>
                ) : null}
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                  onClick={() =>
                    form.reset({
                      name: user.name ?? "",
                      nickname: user.nickname,
                    })
                  }
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isDirty
                  }
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold">Sign out</h2>
                <p className="text-xs text-muted-foreground">
                  End your session on this device.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                void signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
