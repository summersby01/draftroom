"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PROJECT_TYPE_OPTIONS } from "@/lib/constants";

const CHIP_OPTIONS = [
  { value: "all", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "due_soon", label: "Due soon" },
  { value: "in_progress", label: "In progress" }
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
    <div className="space-y-2.5">
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-1">
          {CHIP_OPTIONS.map((chip) => {
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
                    ? "rounded-full bg-deep-blue px-3.5 py-2 text-[13px] font-bold text-white"
                    : "rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink-soft"
                }
              >
                {chip.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
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
      </div>
    </div>
  );
}
