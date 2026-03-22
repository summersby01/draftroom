"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleDashed, Disc3, FilePenLine } from "lucide-react";

import { ProjectInlineEditor } from "@/components/projects/project-inline-editor";
import { Card, CardContent } from "@/components/ui/card";
import { CARD_THEMES, getProjectCardThemeName } from "@/lib/card-themes";
import { getDeadlineLabel, getProjectRisks } from "@/lib/project-insights";
import { getProjectProgressState, normalizeStageStatus } from "@/lib/project-status";
import type { Project } from "@/types/project";
import { ProgressBar } from "@/components/projects/progress-bar";
import { RiskBadge } from "@/components/projects/status-badge";

export function ProjectCard({ project, activeProjects }: { project: Project; activeProjects?: Project[] }) {
  const [localProject, setLocalProject] = useState(project);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const risks = getProjectRisks(localProject, activeProjects ?? [localProject]);
  const progressState = getProjectProgressState(localProject);
  const themeName = getProjectCardThemeName({
    overall_status: localProject.overall_status,
    submission_done: localProject.submission_done,
    hasUrgentRisk: risks.some((risk) => risk.type === "overdue" || risk.type === "at_risk"),
    hasDeadlineRisk: risks.some((risk) => risk.type === "due_today" || risk.type === "due_soon")
  });
  const theme = CARD_THEMES[themeName];
  const stages = [
    { label: "Syllable", status: progressState.stages.syllable_status },
    { label: "Chorus", status: progressState.stages.chorus_status },
    { label: "Lyrics", status: progressState.stages.verse_status }
  ] as const;

  return (
    <Card className={`${theme.card} rounded-[30px]`}>
      <CardContent className="space-y-4 p-5">
        <Link href={`/projects/${localProject.id}`} className="block transition duration-150 hover:scale-[1.01] active:scale-[0.99]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-xs font-bold uppercase tracking-[0.14em] ${theme.eyebrow}`}>
                {getDeadlineLabel(localProject)}
              </p>
              <p className={`mt-2 truncate text-xl font-black tracking-[-0.03em] ${theme.textPrimary}`}>
                {localProject.title}
              </p>
              {(localProject.artist || localProject.client) ? (
                <p className={`mt-1 truncate text-sm font-semibold ${theme.textSecondary}`}>
                  {[localProject.artist, localProject.client].filter(Boolean).join(" • ")}
                </p>
              ) : null}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${theme.statusPill}`}>{getStatusLabel(localProject.overall_status)}</span>
          </div>

          <ProgressBar value={progressState.progressPercent} tone={theme.progressTone} />

          <div className="grid grid-cols-3 gap-2">
            {stages.map((stage) => (
              <div key={stage.label} className={`rounded-2xl px-3 py-2.5 ${theme.surface}`}>
                <p className="truncate text-[11px] font-semibold text-ink/60">{stage.label}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StageGlyph status={stage.status} />
                  <span className="truncate text-xs font-bold text-ink">{stage.status.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          </div>

          {risks.length ? (
            <div className="flex flex-wrap gap-2">
              {risks.slice(0, 2).map((risk) => (
                <RiskBadge key={risk.type} risk={risk} />
              ))}
            </div>
          ) : null}
        </Link>

        <ProjectInlineEditor project={localProject} onProjectChange={(next) => setLocalProject((current) => ({ ...current, ...next }))} />
      </CardContent>
    </Card>
  );
}

function getStatusLabel(status: Project["overall_status"]) {
  return status.replace("_", " ");
}

function StageGlyph({ status }: { status: Project["syllable_status"] }) {
  status = normalizeStageStatus(status);

  if (status === "completed") {
    return <Disc3 className="h-3.5 w-3.5 text-success" />;
  }

  if (status === "in_progress") {
    return <FilePenLine className="h-3.5 w-3.5 text-note-blue" />;
  }

  return <CircleDashed className="h-3.5 w-3.5 text-ink-muted" />;
}
