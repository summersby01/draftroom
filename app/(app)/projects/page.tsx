import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2 } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsQuickFilters } from "@/components/projects/projects-quick-filters";
import { Card, CardContent } from "@/components/ui/card";
import { getProjects } from "@/lib/data/projects";
import { getProjectDueDateTime } from "@/lib/project-status";
import type { OverallStatus, Project, ProjectFilters as ProjectFilterValues, ProjectType } from "@/types/project";

const STATUSES: readonly OverallStatus[] = ["planned", "in_progress", "submitted", "on_hold", "overdue"];
const TYPES: readonly ProjectType[] = ["lyrics", "adaptation", "ost", "idol", "topline", "other"];
const SUBMITTED_OPTIONS: readonly NonNullable<ProjectFilterValues["submitted"]>[] = ["all", "yes", "no"];
const SORT_OPTIONS: readonly NonNullable<ProjectFilterValues["sort"]>[] = [
  "due_at",
  "received_at",
  "updated_at",
  "created_at",
  "progress_percent"
];

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view = typeof params.view === "string" ? params.view : "all";
  const projects = await getProjects({
    query: typeof params.query === "string" ? params.query : undefined,
    status:
      typeof params.status === "string" && STATUSES.includes(params.status as OverallStatus)
        ? (params.status as OverallStatus)
        : "all",
    type:
      typeof params.type === "string" && TYPES.includes(params.type as ProjectType)
        ? (params.type as ProjectType)
        : "all",
    submitted:
      typeof params.submitted === "string" &&
      SUBMITTED_OPTIONS.includes(params.submitted as NonNullable<ProjectFilterValues["submitted"]>)
        ? (params.submitted as NonNullable<ProjectFilterValues["submitted"]>)
        : "all",
    sort:
      typeof params.sort === "string" && SORT_OPTIONS.includes(params.sort as NonNullable<ProjectFilterValues["sort"]>)
        ? (params.sort as NonNullable<ProjectFilterValues["sort"]>)
        : "due_at"
  });

  const activeProjects = sortActiveProjects(projects.filter((project) => project.overall_status !== "submitted"));
  const submittedProjects = [...projects.filter((project) => project.overall_status === "submitted")].sort(
    (a, b) => new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime()
  );
  const dueSoonProjects = activeProjects.filter((project) => {
    const days = differenceInCalendarDays(getProjectDueDateTime(project), new Date());
    return days >= 0 && days <= 3;
  });

  const showingAllActive = view === "active" || view === "due_soon";
  const showingAllSubmitted = view === "submitted";
  const activeFeed = view === "due_soon" ? dueSoonProjects : activeProjects;
  const visibleActive = showingAllActive ? activeFeed : activeFeed.slice(0, 8);
  const visibleSubmitted = showingAllSubmitted ? submittedProjects : submittedProjects.slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description="Focus on what is still moving, then skim the latest delivered work without crowding the feed."
        ctaLabel="New Project"
        ctaHref="/projects/new"
      />

      <ProjectsQuickFilters />

      <ProjectsSectionHeader
        title={view === "due_soon" ? "Due soon" : "Active"}
        count={activeFeed.length}
        actionLabel={showingAllActive ? "Show less" : "View all"}
        actionHref={showingAllActive ? "/projects" : "/projects?view=active"}
      />
      {visibleActive.length ? (
        <div className="space-y-3">
          {visibleActive.map((project) => (
            <ProjectCard key={project.id} project={project} activeProjects={activeProjects} />
          ))}
        </div>
      ) : (
        <EmptyState message={view === "due_soon" ? "No projects are due soon." : "No active projects match the current filters."} />
      )}

      {view !== "due_soon" ? (
        <>
          <ProjectsSectionHeader
            title="Submitted (Recent)"
            count={submittedProjects.length}
            actionLabel={showingAllSubmitted ? "Show less" : "View all"}
            actionHref={showingAllSubmitted ? "/projects" : "/projects?view=submitted"}
          />
          {visibleSubmitted.length ? (
            <div className="space-y-3">
              {visibleSubmitted.map((project) => (
                <SubmittedProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState message="No submitted projects yet." />
          )}
        </>
      ) : null}
    </div>
  );
}

function sortActiveProjects(projects: Project[]) {
  return [...projects].sort((a, b) => {
    const aOverdue = a.overall_status === "overdue" ? 0 : 1;
    const bOverdue = b.overall_status === "overdue" ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;

    const dueDelta = getProjectDueDateTime(a).getTime() - getProjectDueDateTime(b).getTime();
    if (dueDelta !== 0) return dueDelta;

    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function ProjectsSectionHeader({
  title,
  count,
  actionLabel,
  actionHref
}: {
  title: string;
  count: number;
  actionLabel: string;
  actionHref: Route;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[1.35rem] font-black tracking-[-0.04em] text-ink">{title}</h2>
        <p className="text-sm text-ink-soft">{count} project{count === 1 ? "" : "s"}</p>
      </div>
      <Link href={actionHref} className="text-sm font-bold text-blue-muted">
        {actionLabel}
      </Link>
    </div>
  );
}

function SubmittedProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}` as Route}>
      <Card className="rounded-[28px] border border-line bg-white shadow-none transition duration-150 hover:border-blue-muted">
        <CardContent className="flex items-start justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-ink">{project.title}</p>
            <p className="mt-1 truncate text-sm text-ink-soft">
              {[project.artist, project.client].filter(Boolean).join(" • ") || "Independent project"}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Submitted {project.submitted_at ? formatSubmittedDate(project.submitted_at) : "recently"}
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-surface-soft p-2">
            <CheckCircle2 className="h-5 w-5 text-deep-blue" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatSubmittedDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric"
  }).format(date);
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-sm text-ink-soft">{message}</CardContent>
    </Card>
  );
}
