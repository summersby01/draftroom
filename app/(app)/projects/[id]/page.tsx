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
import { formatDate, formatDueDateTime, getProjectProgressState, normalizeStageStatus } from "@/lib/project-status";
import type { SubmissionStatus } from "@/types/project";

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
  const progressState = getProjectProgressState(project);

  return (
    <div className="space-y-5">
      <PageHeader title={project.title} description="Quick note view for due date, progress, stage updates, and activity." />

      <Card className="rounded-[28px] bg-brand-600">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-white/70">D-day</p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-white">{getDeadlineLabel(project)}</p>
            </div>
            <ProjectStatusBadge status={project.overall_status} />
          </div>
          <ProgressBar value={progressState.progressPercent} />
          <div className="flex flex-wrap gap-2">
            <Badge variant="muted">{project.project_type}</Badge>
            <Badge variant="muted">Received {formatDate(project.received_at)}</Badge>
            <Badge variant="muted">Due {formatDueDateTime(project)}</Badge>
            {risks.map((risk) => (
              <RiskBadge key={risk.type} risk={risk} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] bg-note-yellow">
        <CardHeader>
          <h2 className="text-lg font-bold tracking-tight text-ink">Stage snapshot</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <StageRow label="Syllable planning" status={progressState.stages.syllable_status} />
          <StageRow label="Chorus writing" status={progressState.stages.chorus_status} />
          <StageRow label="Remaining lyrics" status={progressState.stages.verse_status} />
        </CardContent>
      </Card>

      <Card className="rounded-[28px] bg-note-green">
        <CardHeader>
          <h2 className="text-lg font-bold tracking-tight text-ink">Project details</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <MetaRow label="Artist" value={project.artist || "Not set"} />
          <MetaRow label="Client" value={project.client || "Not set"} />
          <MetaRow label="Submitted" value={formatDate(project.submitted_at)} />
          <MetaRow label="Submission result" value={getSubmissionStatusLabel(project.submission_status)} />
          <MetaRow label="Accepted" value={formatDate(project.accepted_at)} />
          <MetaRow label="Portfolio" value={project.is_portfolio ? "Included" : "Not included"} />
        </CardContent>
      </Card>

      <ProjectForm project={project} detailMode />

      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-ink">Activity Timeline</h2>
        {activity.length ? (
          <div className="space-y-3">
            {activity.map((item, index) => (
              <div key={item.id} className={`rounded-[24px] p-4 transition duration-150 hover:scale-[1.01] active:scale-[0.99] ${getTileColor(index)}`}>
                <p className="text-sm font-semibold text-ink">{item.message}</p>
                <p className="mt-2 text-xs text-ink/60">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No activity recorded for this project yet.</p>
        )}
      </section>

      <section className="space-y-3 pb-6">
        <h2 className="text-lg font-bold tracking-tight text-ink">Danger Zone</h2>
        <DeleteProjectDialog id={project.id} />
      </section>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-ink/60">{label}</p>
      <p className="text-right font-semibold text-ink">{value}</p>
    </div>
  );
}

function StageRow({ label, status }: { label: string; status: "not_started" | "in_progress" | "completed" }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/45 p-4">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <StageStatusBadge status={normalizeStageStatus(status)} />
    </div>
  );
}

function getTileColor(index: number) {
  const tones = ["bg-note-blue", "bg-note-yellow", "bg-note-green", "bg-note-purple", "bg-note-coral"] as const;
  return tones[index % tones.length];
}

function getSubmissionStatusLabel(status: SubmissionStatus) {
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Not selected";
  return "Awaiting result";
}
