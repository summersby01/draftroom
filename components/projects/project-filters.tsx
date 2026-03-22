"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ProjectFilters({ archive = false }: { archive?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    router.push(`${archive ? "/archive" : "/projects"}?${params.toString()}`);
  };

  return (
    <div
      className={`grid gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft ${
        archive ? "md:grid-cols-6" : "md:grid-cols-5"
      }`}
    >
      <Input
        defaultValue={searchParams.get("query") ?? ""}
        placeholder="Search title, artist, client"
        onChange={(event) => update("query", event.target.value)}
      />
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onChange={(event) => update("status", event.target.value)}
        options={[
          { value: "all", label: "All statuses" },
          { value: "planned", label: "Planned" },
          { value: "in_progress", label: "In progress" },
          { value: "on_hold", label: "On hold" },
          { value: "submitted", label: "Submitted" },
          { value: "overdue", label: "Overdue" }
        ]}
      />
      <Select
        defaultValue={searchParams.get("type") ?? "all"}
        onChange={(event) => update("type", event.target.value)}
        options={[{ value: "all", label: "All types" }, ...PROJECT_TYPE_OPTIONS]}
      />
      <Select
        defaultValue={searchParams.get("submitted") ?? (archive ? "yes" : "all")}
        onChange={(event) => update("submitted", event.target.value)}
        options={[
          { value: "all", label: "All submission states" },
          { value: "yes", label: "Submitted" },
          { value: "no", label: "Not submitted" }
        ]}
      />
      {archive ? (
        <Input
          defaultValue={searchParams.get("year") ?? ""}
          placeholder="Year"
          onChange={(event) => update("year", event.target.value)}
        />
      ) : null}
      <div className="flex gap-2">
        <Select
          className="flex-1"
          defaultValue={searchParams.get("sort") ?? "due_at"}
          onChange={(event) => update("sort", event.target.value)}
          options={[
            { value: "due_at", label: "Sort: Due date" },
            { value: "received_at", label: "Sort: Received date" },
            { value: "updated_at", label: "Sort: Recently updated" },
            { value: "created_at", label: "Sort: Recently added" },
            { value: "progress_percent", label: "Sort: Progress" }
          ]}
        />
        <Button variant="outline" onClick={() => router.push(archive ? "/archive" : "/projects")}>
          Reset
        </Button>
      </div>
    </div>
  );
}
