"use client";

import Link from "next/link";
import type { Route } from "next";
import { Check, Star } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateProjectInline } from "@/app/actions/projects";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Project } from "@/types/project";

export function ArchiveProjectList({
  groupedProjects
}: {
  groupedProjects: Array<[string, Project[]]>;
}) {
  const [filter, setFilter] = useState<"all" | "accepted" | "portfolio">("all");
  const [overrides, setOverrides] = useState<Record<string, Project>>({});

  const filteredGroups = useMemo(
    () =>
      groupedProjects
        .map(([year, projects]) => [
          year,
          projects
            .map((project) => overrides[project.id] ?? project)
            .filter((project) => {
              if (filter === "accepted") return project.is_accepted;
              if (filter === "portfolio") return project.is_accepted && project.is_portfolio;
              return true;
            })
        ] as [string, Project[]])
        .filter(([, projects]) => projects.length > 0),
    [filter, groupedProjects, overrides]
  );

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-1">
          {[
            { value: "all", label: "All" },
            { value: "accepted", label: "Accepted" },
            { value: "portfolio", label: "Portfolio" }
          ].map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setFilter(chip.value as typeof filter)}
              className={
                filter === chip.value
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
                    onAccepted={(updated) =>
                      setOverrides((current) => ({
                        ...current,
                        [updated.id]: updated
                      }))
                    }
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-sm text-ink-soft">
            No submitted projects match the current archive filter.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ArchiveProjectCard({
  project,
  onAccepted
}: {
  project: Project;
  onAccepted: (project: Project) => void;
}) {
  const [localProject, setLocalProject] = useState(project);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const handleAcceptedChange = () => {
    const optimisticAcceptedAt = new Date().toISOString();
    const optimisticProject: Project = {
      ...localProject,
      is_accepted: true,
      accepted_at: optimisticAcceptedAt
    };

    setLocalProject(optimisticProject);
    onAccepted(optimisticProject);

    startTransition(async () => {
      try {
        const updated = await updateProjectInline(localProject.id, { is_accepted: true });
        setLocalProject(updated);
        onAccepted(updated);
        toast.success("Marked as accepted");
      } catch (error) {
        setLocalProject(project);
        onAccepted(project);
        toast.error(error instanceof Error ? error.message : "Could not update accepted state");
      }
    });
  };

  return (
    <div className={getArchiveCardClassName(localProject)}>
      <Link href={`/projects/${localProject.id}` as Route} className="block">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-ink">{localProject.title}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {[localProject.artist, localProject.client].filter(Boolean).join(" • ") || "Independent project"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <div className={getMetaPillClassName(localProject)}>Submitted {formatSubmittedDate(localProject.submitted_at)}</div>
          <div className={getMetaPillClassName(localProject)}>{localProject.project_type}</div>
          {localProject.is_accepted ? (
            <>
              <div className={getAcceptedBadgeClassName(localProject)}>
                <Check className="h-3.5 w-3.5" />
                Accepted
              </div>
              <div className={getMetaPillClassName(localProject)}>
                Accepted {formatAcceptedDate(localProject.accepted_at)}
              </div>
            </>
          ) : null}
          {localProject.is_portfolio ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 font-semibold text-[#16a34a]">
              <Star className="h-3.5 w-3.5 fill-[#16a34a]" />
              Portfolio
            </div>
          ) : null}
          {localProject.portfolio_note ? (
            <div className={getNoteClassName(localProject)}>
              {localProject.portfolio_note}
            </div>
          ) : localProject.notes ? (
            <div className={getNoteClassName(localProject)}>
              {localProject.notes}
            </div>
          ) : null}
        </div>
      </Link>

      {!localProject.is_accepted ? (
        <div className="mt-3 flex justify-end">
          <AcceptProjectButton isPending={isPending} onClick={handleAcceptedChange} />
        </div>
      ) : null}
    </div>
  );
}

function AcceptProjectButton({
  isPending,
  onClick
}: {
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="inline-flex min-h-9 items-center gap-1 rounded-full bg-action/12 px-4 py-2 text-xs font-semibold text-action transition duration-150 hover:bg-action/18 disabled:opacity-60"
    >
      <span>Accept</span>
      <Check className="h-3.5 w-3.5" />
    </button>
  );
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

function formatAcceptedDate(value: string | null) {
  if (!value) return "recently";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function getArchiveCardClassName(project: Project) {
  if (project.is_portfolio) {
    return "rounded-[24px] border-[2px] border-l-[6px] border-[#16a34a] bg-[#f3fff6] p-4 shadow-soft transition duration-150 hover:translate-y-[-1px] hover:shadow-panel";
  }

  if (project.is_accepted) {
    return "rounded-[24px] border border-l-[5px] border-[#22c55e] bg-[#f8fff9] p-4 transition duration-150 hover:translate-y-[-1px] hover:shadow-panel";
  }

  return "rounded-[24px] border border-line bg-surface-soft p-4 transition duration-150 hover:translate-y-[-1px] hover:shadow-panel";
}

function getMetaPillClassName(project: Project) {
  if (project.is_portfolio) {
    return "rounded-full bg-white/90 px-3 py-1.5 text-ink-soft";
  }

  if (project.is_accepted) {
    return "rounded-full bg-white px-3 py-1.5 text-ink-soft";
  }

  return "rounded-full bg-white px-3 py-1.5 text-ink-soft";
}

function getAcceptedBadgeClassName(project: Project) {
  if (project.is_portfolio) {
    return "inline-flex items-center gap-1 rounded-full bg-[#16a34a] px-3 py-1.5 font-semibold text-white";
  }

  return "inline-flex items-center gap-1 rounded-full bg-[#22c55e]/15 px-3 py-1.5 font-semibold text-[#22c55e]";
}

function getNoteClassName(project: Project) {
  if (project.is_portfolio) {
    return "w-full rounded-[18px] bg-white/90 px-3 py-2 text-sm text-ink-soft";
  }

  if (project.is_accepted) {
    return "w-full rounded-[18px] bg-white px-3 py-2 text-sm text-ink-soft";
  }

  return "w-full rounded-[18px] bg-white px-3 py-2 text-sm text-ink-soft";
}
