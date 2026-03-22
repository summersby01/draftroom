import type { ReactNode } from "react";
import Link from "next/link";
import { FilePenLine, LayoutDashboard, LibraryBig, LogOut, Settings2 } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { DraftRoomLogo } from "@/components/layout/draft-room-logo";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  "/dashboard": LayoutDashboard,
  "/projects": FilePenLine,
  "/archive": LibraryBig,
  "/settings": Settings2
};

export function AppShell({
  pathname,
  children
}: {
  pathname: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-4">
      <header className="sticky top-0 z-20 -mx-4 mb-5 border-b border-line/80 bg-paper/90 px-4 pb-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3 pt-1">
          <DraftRoomLogo withWordmark />
          <form action={signOut}>
            <button className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-soft transition hover:bg-brand-50 hover:text-brand-700">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </button>
          </form>
        </div>
      </header>

      <main className="min-w-0 flex-1">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-line bg-surface/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur">
        <div className="grid grid-cols-4 gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = icons[item.href as keyof typeof icons];
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-paper-soft hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
