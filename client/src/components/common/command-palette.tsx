"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  BookOpenCheck,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUiStore } from "@/store/ui-store";
import { useAuth } from "@/providers/auth-provider";
import { useSubjects } from "@/hooks/use-subjects";

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const { signOut, isAuthenticated } = useAuth();
  const { subjects } = useSubjects({ enabled: isAuthenticated });

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!useUiStore.getState().commandOpen);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <Command
          label="Command palette"
          className="flex flex-col [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          <Command.Input
            placeholder="Type a command or search…"
            className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-[60vh] overflow-y-auto p-2 text-sm">
            <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation">
              <CommandItem
                onSelect={() => navigate("/dashboard")}
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Go to Dashboard"
              />
              <CommandItem
                onSelect={() => navigate("/settings")}
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
              />
            </Command.Group>

            {subjects && subjects.length > 0 ? (
              <Command.Group heading="Subjects">
                {subjects.slice(0, 10).map((subject) => (
                  <CommandItem
                    key={subject.id}
                    onSelect={() => navigate(`/subjects/${subject.id}`)}
                    icon={<BookOpenCheck className="h-4 w-4" />}
                    label={subject.name}
                  />
                ))}
              </Command.Group>
            ) : null}

            <Command.Group heading="Actions">
              <CommandItem
                onSelect={() => navigate("/dashboard?action=create-subject")}
                icon={<Plus className="h-4 w-4" />}
                label="Create new subject"
              />
              {subjects && subjects.length > 0 ? (
                <CommandItem
                  onSelect={() =>
                    navigate(`/subjects/${subjects[0].id}?tab=generate`)
                  }
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Generate flashcards with AI"
                />
              ) : null}
              {isAuthenticated ? (
                <CommandItem
                  onSelect={async () => {
                    setOpen(false);
                    await signOut();
                  }}
                  icon={<LogOut className="h-4 w-4" />}
                  label="Sign out"
                />
              ) : null}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandItem({
  onSelect,
  icon,
  label,
}: {
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/90 outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Command.Item>
  );
}
