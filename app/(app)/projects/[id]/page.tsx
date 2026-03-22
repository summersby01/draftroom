import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";

import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge, RiskBadge, StageStatusBadge } from "@/components/projects/status-badge";
import { ProjectForm } from "@/components/forms/project-form";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressBar } from "@/components/projects/progress-bar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getProjectById, getProjectHistory, getProjects } from "@/lib/data/projects";
import { formatHistoryMessage, getDeadlineLabel, getProjectRisks } from "@/lib/project-insights";
import { formatDate } from "@/lib/project-status";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, history, activeProjects] = await Promise.all([
    getProjectById(id),
    getProjectHistory(id),
    getProjects({ submitted: "no" })
  ]);

  if (!project) notFound();

  const risks = getProjectRisks(project, activeProjects);
  const activity = history.map((entry) => formatHistoryMessage(entry, project.title));

  return (
    <div className="space-y-4">
      <PageHeader title={project.title} description="Update stage progress, keep notes current, and manage the submission state for this commission." />

      <Card className="bg-paper-soft">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-ink-soft">Deadline</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{getDeadlineLabel(project)}</p>
            </div>
            <ProjectStatusBadge status={project.overall_status} />
          </div>
          <ProgressBar value={project.progress_percent} />
          <div className="flex flex-wrap gap-2">
            <Badge variant="muted">{project.project_type}</Badge>
            <Badge variant="muted">Received {formatDate(project.received_at)}</Badge>
            <Badge variant="muted">Due {formatDate(project.due_at)}</Badge>
            {risks.map((risk) => (
              <RiskBadge key={risk.type} risk={risk} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Project summary</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <MetaRow label="Artist" value={project.artist || "Not set"} />
          <MetaRow label="Client" value={project.client || "Not set"} />
          <MetaRow label="Submitted" value={formatDate(project.submitted_at)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Stage overview</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <StageRow label="Syllable planning" status={project.syllable_status} />
          <StageRow label="Chorus writing" status={project.chorus_status} />
          <StageRow label="Remaining lyrics" status={project.verse_status} />
        </CardContent>
      </Card>

      <ProjectForm project={project} detailMode />

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Activity timeline</h2>
        </CardHeader>
        <CardContent>
          {activity.length ? (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="rounded-2xl border border-line bg-surface-soft p-4">
                  <p className="text-sm font-medium text-ink">{item.message}</p>
                  <p className="mt-2 text-xs text-ink-muted">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">No activity recorded for this project yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Danger zone</h2>
        </CardHeader>
        <CardContent>
          <DeleteProjectDialog id={project.id} />
        </CardContent>
      </Card>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-ink-muted">{label}</p>
      <p className="text-right font-medium text-ink">{value}</p>
    </div>
  );
}

function StageRow({ label, status }: { label: string; status: "not_started" | "in_progress" | "completed" }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface-soft p-4">
      <p className="text-sm font-medium text-ink">{label}</p>
      <StageStatusBadge status={status} />
    </div>
  );
}
