import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { SummaryCard } from "@/components/dashboard/summary-card";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/projects/project-card";
import { RiskBadge } from "@/components/projects/status-badge";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/data/projects";
import { getDeadlineLabel } from "@/lib/project-insights";

export default async function DashboardPage() {
  await requireUser();
  const data = await getDashboardData();
  const activeProjects = [...data.overdue, ...data.dueSoon, ...data.inProgress];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Quick project notes, risks, and recent changes."
        ctaLabel="New Project"
        ctaHref="/projects/new"
      />

      <section className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-3 pb-1">
          <SummaryCard label="Overdue" value={data.stats.overdueCount} hint="Past due" />
          <SummaryCard label="Due Today" value={data.stats.dueTodayCount} hint="Needs focus" />
          <SummaryCard label="Due Soon" value={data.stats.dueSoonCount} hint="Up next" />
        </div>
      </section>

      <Section title="Deadline Risks">
        {data.deadlineRisks.length ? (
          <div className="space-y-3">
            {data.deadlineRisks.map(({ project, risks }, index) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`block rounded-[24px] p-4 ${getTileColor(index)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-ink">{project.title}</p>
                    <p className="mt-1 text-sm text-ink/70">{getDeadlineLabel(project)}</p>
                  </div>
                  <div className="flex max-w-[46%] flex-wrap justify-end gap-2">
                    {risks.map((risk) => (
                      <RiskBadge key={risk.type} risk={risk} />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No deadline risks right now.</p>
        )}
      </Section>

      <Section title="In Progress">
        {data.inProgress.length ? (
          <div className="space-y-3">
            {data.inProgress.map((project) => (
              <ProjectCard key={project.id} project={project} activeProjects={activeProjects} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No active writing sessions yet.</p>
        )}
      </Section>

      <Section title="Recent Activity">
        {data.recentActivity.length ? (
          <div className="space-y-3">
            {data.recentActivity.map((item, index) => (
              <Link key={item.id} href={`/projects/${item.project_id}`} className={`block rounded-[24px] p-4 ${getTileColor(index + 1)}`}>
                <p className="text-base font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-ink/70">{item.message}</p>
                <p className="mt-2 text-xs font-medium text-ink/50">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No activity yet.</p>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

function getTileColor(index: number) {
  const colors = ["bg-note-yellow", "bg-note-green", "bg-note-blue", "bg-note-purple"] as const;
  return colors[index % colors.length];
}
