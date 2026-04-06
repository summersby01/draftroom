"use client";

import Link from "next/link";
import type { Route } from "next";
import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Project, SubmissionStatus } from "@/types/project";

const FAVORITES_KEY = "draft-room-archive-favorites";

export function ArchiveProjectList({
  groupedProjects
}: {
  groupedProjects: Array<[string, Project[]]>;
}) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [view, setView] = useState<"all" | "favorites">("all");
  const [resultFilter, setResultFilter] = useState<"all" | SubmissionStatus>("all");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavoriteIds(JSON.parse(stored) as string[]);
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const filteredGroups = groupedProjects
    .map(([year, projects]) => [
      year,
      projects.filter((project) => {
        if (view === "favorites" && !favoriteSet.has(project.id)) return false;
        if (resultFilter !== "all" && project.submission_status !== resultFilter) return false;
        return true;
      })
    ] as [string, Project[]])
    .filter(([, projects]) => projects.length > 0);

  function toggleFavorite(id: string) {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-1">
          <button
            type="button"
            onClick={() => setView("all")}
            className={
              view === "all"
                ? "rounded-full bg-deep-blue px-3.5 py-2 text-[13px] font-bold text-white"
                : "rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink-soft"
            }
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setView("favorites")}
            className={
              view === "favorites"
                ? "rounded-full bg-deep-blue px-3.5 py-2 text-[13px] font-bold text-white"
                : "rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink-soft"
            }
          >
            Favorites
          </button>
          {[
            { value: "all", label: "All" },
            { value: "accepted", label: "Accepted" },
            { value: "pending", label: "Pending" },
            { value: "rejected", label: "Rejected" }
          ].map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setResultFilter(chip.value as "all" | SubmissionStatus)}
              className={
                resultFilter === chip.value
                  ? "rounded-full bg-deep-blue px-3.5 py-2 text-[13px] font-bold text-white"
                  : "rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink-soft"
              }
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {filteredGroups.length ? (
        <div className="space-y-4">
          {filteredGroups.map(([year, items]) => (
            <Card key={year}>
              <CardHeader className="pb-3">
                <h2 className="text-lg font-bold tracking-tight text-ink">{year}</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((project) => (
                  <ArchiveProjectCard
                    key={project.id}
                    project={project}
                    isFavorite={favoriteSet.has(project.id)}
                    onToggleFavorite={() => toggleFavorite(project.id)}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-sm text-ink-soft">
            {view === "favorites" ? "No favorite archive projects yet." : "No submitted projects match the current archive filters."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ArchiveProjectCard({
  project,
  isFavorite,
  onToggleFavorite
}: {
  project: Project;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <Link href={`/projects/${project.id}` as Route}>
      <div className="rounded-[24px] border border-line bg-surface-soft p-4 transition duration-150 hover:translate-y-[-1px] hover:shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-ink">{project.title}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {[project.artist, project.client].filter(Boolean).join(" • ") || "Independent project"}
            </p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onToggleFavorite();
            }}
            className="shrink-0 rounded-full bg-white p-2 text-ink-soft transition duration-150 hover:text-action"
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
          >
            <Star className={`h-4 w-4 ${isFavorite ? "fill-action text-action" : ""}`} />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <div className="rounded-full bg-white px-3 py-1.5 text-ink-soft">Submitted {formatSubmittedDate(project.submitted_at)}</div>
          <div className="rounded-full bg-white px-3 py-1.5 text-ink-soft">{project.project_type}</div>
          <SubmissionStatusBadge status={project.submission_status} />
          {project.notes ? (
            <div className="w-full rounded-[18px] bg-white px-3 py-2 text-sm text-ink-soft">
              {project.notes}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  if (status === "accepted") {
    return <div className="rounded-full bg-success/15 px-3 py-1.5 text-success">Accepted</div>;
  }

  if (status === "rejected") {
    return <div className="rounded-full bg-gray-200 px-3 py-1.5 text-ink-soft">Not selected</div>;
  }

  return <div className="rounded-full bg-white px-3 py-1.5 text-ink-soft">Awaiting result</div>;
}

function formatSubmittedDate(value: string | null) {
  if (!value) return "recently";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
