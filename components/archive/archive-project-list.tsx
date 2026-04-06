"use client";

import Link from "next/link";
import type { Route } from "next";
import { Check, Star } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateProjectInline } from "@/app/actions/projects";
import {
  AlertDialog,
  AlertDialogActionButton,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(async () => {
      try {
        const updated = await updateProjectInline(project.id, { is_accepted: true });
        onAccepted(updated);
        setOpen(false);
        router.refresh();
        toast.success("Marked as accepted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not update accepted state");
      }
    });
  };

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
          {project.is_portfolio ? (
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-deep-blue">
              <Star className="h-3.5 w-3.5 fill-deep-blue" />
              Portfolio
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <div className="rounded-full bg-white px-3 py-1.5 text-ink-soft">Submitted {formatSubmittedDate(project.submitted_at)}</div>
          <div className="rounded-full bg-white px-3 py-1.5 text-ink-soft">{project.project_type}</div>
          {project.is_accepted ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 font-semibold text-success">
              <Check className="h-3.5 w-3.5" />
              Accepted
            </div>
          ) : (
            <AcceptProjectButton open={open} setOpen={setOpen} isPending={isPending} onConfirm={handleAccept} />
          )}
          {project.portfolio_note ? (
            <div className="w-full rounded-[18px] bg-white px-3 py-2 text-sm text-ink-soft">
              {project.portfolio_note}
            </div>
          ) : project.notes ? (
            <div className="w-full rounded-[18px] bg-white px-3 py-2 text-sm text-ink-soft">
              {project.notes}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function AcceptProjectButton({
  open,
  setOpen,
  isPending,
  onConfirm
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={isPending ? undefined : setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          onClick={(event) => event.preventDefault()}
          className="min-h-10 rounded-full bg-action px-3.5 py-2 text-sm font-bold text-white transition duration-150 hover:scale-[1.01] hover:bg-brand-600"
        >
          Mark as accepted
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[28px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Mark this project as accepted?</AlertDialogTitle>
          <AlertDialogDescription>
            This will save the accepted result and make the project eligible for Portfolio.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row">
          <AlertDialogCancelButton disabled={isPending}>Cancel</AlertDialogCancelButton>
          <AlertDialogActionButton disabled={isPending} onClick={onConfirm}>
            {isPending ? "Saving..." : "Mark accepted"}
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
