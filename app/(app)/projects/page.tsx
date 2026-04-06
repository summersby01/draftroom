import Link from "next/link";
import type { Route } from "next";
import { differenceInCalendarDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsQuickFilters } from "@/components/projects/projects-quick-filters";
import { Card, CardContent } from "@/components/ui/card";
import { getProjects } from "@/lib/data/projects";
import { getProjectDueDateTime } from "@/lib/project-status";
import type { Project, ProjectType } from "@/types/project";

const TYPES: readonly ProjectType[] = ["lyrics", "adaptation", "ost", "idol", "topline", "other"];

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view = typeof params.view === "string" ? params.view : "all";

  const activeProjects = sortActiveProjects(
    await getProjects({
      query: typeof params.query === "string" ? params.query : undefined,
      type:
        typeof params.type === "string" && TYPES.includes(params.type as ProjectType)
          ? (params.type as ProjectType)
          : "all",
      submitted: "no",
      sort: "due_at"
    })
  );

  const visibleProjects =
    view === "overdue"
      ? activeProjects.filter((project) => project.overall_status === "overdue")
      : view === "due_soon"
        ? activeProjects.filter((project) => {
            const days = differenceInCalendarDays(getProjectDueDateTime(project), new Date());
            return days >= 0 && days <= 3;
          })
        : view === "in_progress"
          ? activeProjects.filter((project) => project.overall_status === "in_progress")
          : activeProjects;

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-[2rem] font-black tracking-[-0.04em] text-ink">Projects</h1>
          <p className="text-sm text-ink-soft">Manage active songs, keep deadlines visible, and move finished work to Archive.</p>
        </div>
        <div className="pt-1">
          <Button asChild size="sm" className="min-h-10 px-4 text-sm font-bold">
            <Link href={"/projects/new" as Route}>New Project</Link>
          </Button>
        </div>
      </div>

      <ProjectsQuickFilters />

      {visibleProjects.length ? (
        <div className="space-y-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} activeProjects={activeProjects} />
          ))}
        </div>
      ) : (
        <EmptyState
          message={
            view === "overdue"
              ? "No overdue projects."
              : view === "due_soon"
                ? "No projects are due soon."
                : view === "in_progress"
                  ? "No projects are currently in progress."
                  : "No active projects match the current filters."
          }
        />
      )}
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

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-sm text-ink-soft">{message}</CardContent>
    </Card>
  );
}
