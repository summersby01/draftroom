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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-paper px-4 pb-24 pt-4">
      <header className="sticky top-0 z-20 -mx-4 mb-5 bg-paper px-4 pb-4">
        <div className="flex items-center justify-between gap-3 pt-1">
          <DraftRoomLogo withWordmark />
          <form action={signOut}>
            <button className="flex min-h-11 items-center gap-2 rounded-2xl bg-action px-3 py-2 text-sm font-medium text-white transition duration-150 hover:bg-brand-600 hover:scale-[1.01] active:scale-[0.98]">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </button>
          </form>
        </div>
      </header>

      <main className="min-w-0 flex-1">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md bg-paper px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
        <div className="rounded-[28px] border border-line bg-white p-2">
          <div className="grid grid-cols-4 gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = icons[item.href as keyof typeof icons];
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[20px] px-2 py-2 text-[11px] font-semibold transition duration-150 active:scale-[0.98]",
                  active
                    ? "bg-deep-blue text-white"
                    : "text-ink-soft hover:bg-gray-100 hover:text-ink hover:scale-[1.01]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          </div>
        </div>
      </nav>
    </div>
  );
}
