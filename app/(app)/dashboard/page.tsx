import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { SummaryCard } from "@/components/dashboard/summary-card";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/projects/project-card";
import { RiskBadge } from "@/components/projects/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/projects";
import { getDeadlineLabel } from "@/lib/project-insights";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const activeProjects = [...data.overdue, ...data.dueSoon, ...data.inProgress];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="Deadline pressure, writing progress, and recent archive activity in one thumb-friendly view."
        ctaLabel="New project"
        ctaHref="/projects/new"
      />

      <section className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-3 pb-1">
          <SummaryCard label="Overdue" value={data.stats.overdueCount} hint="Past due and open" />
          <SummaryCard label="Due Today" value={data.stats.dueTodayCount} hint="Needs action today" />
          <SummaryCard label="Due Soon" value={data.stats.dueSoonCount} hint="Within three days" />
          <SummaryCard label="In Progress" value={data.stats.inProgressCount} hint="Actively being written" />
          <SummaryCard label="Submitted" value={data.stats.submittedThisMonthCount} hint="Delivered this month" />
        </div>
      </section>

      <RiskListCard items={data.deadlineRisks} />
      <ProjectListSection title="In Progress" projects={data.inProgress} activeProjects={activeProjects} empty="No active writing sessions yet." />
      <ActivityCard items={data.recentActivity} />

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-semibold tracking-tight text-ink">Archive Snapshot</h2>
        <div className="grid gap-3">
          <SummaryCard label="Catalog Total" value={data.archiveStats.totalSubmitted} hint="Submitted projects in your archive" />
          <SummaryCard label="This Year" value={data.archiveStats.submittedThisYear} hint="Completed this calendar year" />
          <SummaryCard label="Avg Completion" value={`${data.archiveStats.averageCompletionDays}d`} hint="From intake to submission" />
        </div>
      </section>
    </div>
  );
}

function RiskListCard({
  items
}: {
  items: Awaited<ReturnType<typeof getDashboardData>>["deadlineRisks"];
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold tracking-tight text-ink">Deadline Risks</h2>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="space-y-3">
            {items.map(({ project, risks }) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-2xl border border-line bg-surface-soft p-4 transition hover:border-brand-200 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{project.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{getDeadlineLabel(project)}</p>
                  </div>
                  <div className="flex max-w-[45%] flex-wrap justify-end gap-2">
                    {risks.map((risk) => (
                      <RiskBadge key={risk.type} risk={risk} />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No active deadline risks right now.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectListSection({
  title,
  projects,
  activeProjects,
  empty
}: {
  title: string;
  projects: Awaited<ReturnType<typeof getDashboardData>>["inProgress"];
  activeProjects: Awaited<ReturnType<typeof getDashboardData>>["inProgress"];
  empty: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        <Button variant="ghost" asChild size="sm">
          <Link href="/projects">View all</Link>
        </Button>
      </div>
      {projects.length ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} activeProjects={activeProjects} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-sm text-ink-soft">{empty}</CardContent>
        </Card>
      )}
    </section>
  );
}

function ActivityCard({
  items
}: {
  items: Awaited<ReturnType<typeof getDashboardData>>["recentActivity"];
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold tracking-tight text-ink">Recent Activity</h2>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/projects/${item.project_id}`}
                className="block rounded-2xl border border-line bg-surface-soft p-4 transition hover:border-brand-200 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{item.message}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-ink-muted">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No activity yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
