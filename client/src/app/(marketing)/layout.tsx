import type { ReactNode } from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
