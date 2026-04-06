"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ArchiveSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(name);
    } else {
      params.set(name, value);
    }

    params.set("tab", "projects");
    router.push(`/archive?${params.toString()}`);
  };

  return (
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
  );
}
