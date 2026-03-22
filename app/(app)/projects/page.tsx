import { PageHeader } from "@/components/layout/page-header";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectCard } from "@/components/projects/project-card";
import { Card, CardContent } from "@/components/ui/card";
import { getProjects } from "@/lib/data/projects";
import type { OverallStatus, ProjectFilters as ProjectFilterValues, ProjectType } from "@/types/project";

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
  const activeProjects = projects.filter((item) => !item.submission_done);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Projects"
        description="Compact project tracking for active writing work, due dates, and progress."
        ctaLabel="New project"
        ctaHref="/projects/new"
      />
      <ProjectFilters />
      {projects.length ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} activeProjects={activeProjects} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-sm text-ink-soft">
            No projects match the current filters.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
