"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PROJECT_TYPE_OPTIONS } from "@/lib/constants";

const TAB_OPTIONS = [
  { value: "all", label: "Active" },
  { value: "due_soon", label: "Due soon" },
  { value: "overdue", label: "Overdue" },
  { value: "submitted", label: "Submitted" }
] as const;

export function ProjectsQuickFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") ?? "all";

  const update = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(name);
    } else {
      params.set(name, value);
    }

    router.push(`/projects?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-5 border-b border-line pb-1">
          {TAB_OPTIONS.map((chip) => {
            if (chip.value === "submitted") {
              return (
                <Link
                  key={chip.value}
                  href={"/archive?tab=projects" as Route}
                  className="relative shrink-0 px-1 pb-3 text-sm font-bold text-ink-soft transition hover:text-ink"
                >
                  <span>Submitted</span>
                </Link>
              );
            }

            const params = new URLSearchParams(searchParams.toString());
            if (chip.value === "all") {
              params.delete("view");
            } else {
              params.set("view", chip.value);
            }

            const href = (params.toString() ? `/projects?${params.toString()}` : "/projects") as Route;
            const active = activeView === chip.value || (chip.value === "all" && !searchParams.get("view"));

            return (
              <Link
                key={chip.value}
                href={href}
                className={
                  active
                    ? "relative shrink-0 px-1 pb-3 text-sm font-black text-deep-blue after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-deep-blue"
                    : "relative shrink-0 px-1 pb-3 text-sm font-bold text-ink-soft transition hover:text-ink"
                }
              >
                {chip.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Card className="rounded-[24px] border border-line bg-white shadow-none">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_144px]">
          <Input
            defaultValue={searchParams.get("query") ?? ""}
            placeholder="Search title, artist, client"
            onChange={(event) => update("query", event.target.value)}
          />
          <Select
            defaultValue={searchParams.get("type") ?? "all"}
            onChange={(event) => update("type", event.target.value)}
            options={[{ value: "all", label: "All types" }, ...PROJECT_TYPE_OPTIONS]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
