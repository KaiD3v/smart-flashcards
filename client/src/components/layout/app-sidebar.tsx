"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard?tab=subjects",
    label: "Subjects",
    icon: BookOpenCheck,
    matches: (path: string) => path.startsWith("/subjects"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/70 bg-background/60 lg:flex">
      <div className="flex h-16 items-center border-b border-border/70 px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.matches
            ? item.matches(pathname)
            : pathname.startsWith(item.href.split("?")[0]);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/12 to-transparent p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI generation
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste any text and let SmartFlashcards craft a deck for you in seconds.
        </p>
      </div>
    </aside>
  );
}
