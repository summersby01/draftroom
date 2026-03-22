import Link from "next/link";
import { CircleDashed, Disc3, FilePenLine } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDeadlineLabel, getProjectRisks } from "@/lib/project-insights";
import { formatDate } from "@/lib/project-status";
import type { Project } from "@/types/project";
import { ProgressBar } from "@/components/projects/progress-bar";
import { ProjectStatusBadge, RiskBadge } from "@/components/projects/status-badge";

export function ProjectCard({ project, activeProjects }: { project: Project; activeProjects?: Project[] }) {
  const risks = getProjectRisks(project, activeProjects ?? [project]);
  const stages = [
    { label: "Syllable", status: project.syllable_status },
    { label: "Chorus", status: project.chorus_status },
    { label: "Lyrics", status: project.verse_status }
  ] as const;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:border-brand-200 hover:shadow-card">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-semibold tracking-tight text-ink">{project.title}</p>
                <Badge variant={project.submission_done ? "green" : "navy"}>{getDeadlineLabel(project)}</Badge>
              </div>
              <p className="mt-1 truncate text-sm text-ink-soft">
                {[project.artist, project.client].filter(Boolean).join(" • ") || "Independent project"}
              </p>
            </div>
            <ProjectStatusBadge status={project.overall_status} />
          </div>

          <ProgressBar value={project.progress_percent} />

          <div className="grid grid-cols-3 gap-2">
            {stages.map((stage) => (
              <div key={stage.label} className="rounded-xl border border-line bg-surface-soft px-3 py-2">
                <p className="text-[11px] text-ink-muted">{stage.label}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StageGlyph status={stage.status} />
                  <span className="text-xs font-medium text-ink">{stage.status.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="muted">{project.project_type}</Badge>
            <Badge variant="muted">Due {formatDate(project.due_at)}</Badge>
            {risks.map((risk) => (
              <RiskBadge key={risk.type} risk={risk} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StageGlyph({ status }: { status: Project["syllable_status"] }) {
  if (status === "completed") {
    return <Disc3 className="h-3.5 w-3.5 text-success" />;
  }

  if (status === "in_progress") {
    return <FilePenLine className="h-3.5 w-3.5 text-brand-700" />;
  }

  return <CircleDashed className="h-3.5 w-3.5 text-ink-muted" />;
}
