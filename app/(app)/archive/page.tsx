import { format } from "date-fns";

import { SummaryCard } from "@/components/dashboard/summary-card";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectStatusBadge } from "@/components/projects/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getArchiveData } from "@/lib/data/projects";
import { formatDate } from "@/lib/project-status";
import type { ProjectType } from "@/types/project";

const TYPES: readonly ProjectType[] = ["lyrics", "adaptation", "ost", "idol", "topline", "other"];

export default async function ArchivePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { projects, stats } = await getArchiveData({
    query: typeof params.query === "string" ? params.query : undefined,
    type:
      typeof params.type === "string" && TYPES.includes(params.type as ProjectType)
        ? (params.type as ProjectType)
        : "all",
    year: typeof params.year === "string" ? params.year : undefined,
    sort: "created_at",
    direction: "desc"
  });

  const grouped = Object.entries(
    projects.reduce<Record<string, typeof projects>>((acc, project) => {
      const year = project.submitted_at ? format(new Date(project.submitted_at), "yyyy") : "Unknown";
      acc[year] = acc[year] ? [...acc[year], project] : [project];
      return acc;
    }, {})
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Archive"
        description="A calm catalog of delivered projects, filtered by year and ready to revisit."
      />
      <section className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-3 pb-1">
        <SummaryCard label="Total submitted" value={stats.totalSubmitted} hint="Projects stored in your finished catalog" />
        <SummaryCard label="Submitted this year" value={stats.submittedThisYear} hint="Completed projects in the current year" />
        <SummaryCard label="Average completion" value={`${stats.averageCompletionDays}d`} hint="Average days from received to submitted" />
        </div>
      </section>
      <ProjectFilters archive />
      {grouped.length ? (
        <div className="space-y-4">
          {grouped.map(([year, items]) => (
            <Card key={year}>
              <CardHeader className="pb-3">
                <h2 className="text-lg font-semibold tracking-tight text-ink">{year}</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-line bg-surface-soft p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold tracking-tight text-ink">{project.title}</p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {[project.artist, project.client].filter(Boolean).join(" • ") || "Independent project"}
                        </p>
                      </div>
                      <ProjectStatusBadge status={project.overall_status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <div className="rounded-full border border-line bg-surface px-3 py-1.5 text-ink-soft">
                        Submitted {formatDate(project.submitted_at)}
                      </div>
                      <div className="rounded-full border border-line bg-surface px-3 py-1.5 text-ink-soft">
                        {project.project_type}
                      </div>
                      <div className="rounded-full border border-line bg-surface px-3 py-1.5 text-ink-soft">
                        {project.progress_percent}% complete
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-sm text-ink-soft">
            No submitted projects match the current archive filters.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
