"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CARD_THEMES, getProjectCardThemeName } from "@/lib/card-themes";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectInlineEditor } from "@/components/projects/project-inline-editor";
import { RiskBadge } from "@/components/projects/status-badge";
import { getDeadlineLabel } from "@/lib/project-insights";
import { ProgressBar } from "@/components/projects/progress-bar";
import { getProjectProgressState } from "@/lib/project-status";
import type { ActivityMessage, Project, ProjectRisk } from "@/types/project";

type DashboardData = {
  overdue: Project[];
  dueSoon: Project[];
  inProgress: Project[];
  recent: Project[];
  recentActivity: ActivityMessage[];
  deadlineRisks: { project: Project; risks: ProjectRisk[] }[];
  stats: { inProgressCount: number };
};

export function DashboardClient({ data }: { data: DashboardData }) {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const activeProjects = dedupeProjects([...localData.overdue, ...localData.dueSoon, ...localData.inProgress]);
  const heroProject =
    localData.deadlineRisks[0]?.project ??
    localData.overdue[0] ??
    localData.dueSoon[0] ??
    localData.inProgress[0] ??
    localData.recent[0] ??
    null;
  const heroRisks = heroProject ? localData.deadlineRisks.find((entry) => entry.project.id === heroProject.id)?.risks ?? [] : [];
  const heroProgressState = heroProject ? getProjectProgressState(heroProject) : null;
  const soonProjects = dedupeProjects(
    [...localData.dueSoon, ...localData.overdue].filter((project) => project.id !== heroProject?.id)
  ).slice(0, 3);
  const inProgressProjects = dedupeProjects(localData.inProgress.filter((project) => project.id !== heroProject?.id)).slice(0, 4);
  const heroProgress = heroProgressState?.progressPercent ?? 0;
  const heroTheme = heroProject
    ? CARD_THEMES[
        getProjectCardThemeName({
          overall_status: heroProject.overall_status,
          submission_done: heroProject.submission_done,
          hasUrgentRisk: heroRisks.some((risk) => risk.type === "overdue" || risk.type === "at_risk"),
          hasDeadlineRisk: heroRisks.some((risk) => risk.type === "due_today" || risk.type === "due_soon")
        })
      ]
    : null;

  return (
    <div className="space-y-8 pb-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-note-purple">Draft Room</p>
          <h1 className="text-[2.4rem] font-black tracking-[-0.05em] text-ink">Your writing room.</h1>
          <p className="max-w-[28rem] text-sm leading-6 text-ink-soft">
            Focus on what is due next, move songs forward, and keep the archive clean.
          </p>
        </div>
        <Button asChild className="min-h-12 w-full text-base font-bold">
          <Link href="/projects/new">New Project</Link>
        </Button>
      </section>

      <section className="space-y-3">
        <SectionTitle title="Focus now" hint={heroProject ? "Most urgent project" : "Start your first project"} />
        {heroProject && heroTheme ? (
          <div className={`rounded-[34px] p-5 ${heroTheme.card}`}>
            <Link href={`/projects/${heroProject.id}`} className="block">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-sm font-bold uppercase tracking-[0.14em] ${heroTheme.eyebrow}`}>{getDeadlineLabel(heroProject)}</p>
                  <h2 className={`mt-2 text-[2rem] font-black tracking-[-0.05em] ${heroTheme.textPrimary}`}>{heroProject.title}</h2>
                  <p className={`mt-1 text-sm font-medium ${heroTheme.textSecondary}`}>
                    {heroProject.artist || heroProject.client || "Independent project"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${heroTheme.statusPill}`}>
                  {heroProject.overall_status.replace("_", " ")}
                </span>
              </div>

              <div className={`mt-6 space-y-2 rounded-[22px] px-4 py-4 ${heroTheme.surfaceSoft}`}>
                <div className={`flex items-center justify-between text-sm font-bold ${heroTheme.textPrimary}`}>
                  <span>Progress</span>
                  <span>{heroProgress}%</span>
                </div>
                <ProgressBar value={heroProgress} tone={heroTheme.progressTone} />
              </div>

              {heroRisks.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {heroRisks.slice(0, 2).map((risk) => (
                    <RiskBadge key={risk.type} risk={risk} />
                  ))}
                </div>
              ) : null}
            </Link>

            <ProjectInlineEditor
              project={heroProject}
              className="mt-4"
              onProjectChange={(project) => setLocalData((current) => replaceProjectInDashboardData(current, project))}
            />
          </div>
        ) : (
          <div className="rounded-[34px] bg-note-purple p-5 text-white">
            <p className="text-sm font-medium text-white/80">No projects yet.</p>
            <p className="mt-2 text-2xl font-black tracking-[-0.04em]">Create your first lyric brief.</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle title="Due soon" hint="Closest deadlines" />
        {soonProjects.length ? (
          <div className="space-y-3">
            {soonProjects.map((project) => (
              <CompactProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyText>No upcoming deadlines right now.</EmptyText>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle title="In progress" hint={`${localData.stats.inProgressCount} active`} />
        {inProgressProjects.length ? (
          <div className="space-y-3">
            {inProgressProjects.map((project) => (
              <ProjectCard key={project.id} project={project} activeProjects={activeProjects} />
            ))}
          </div>
        ) : (
          <EmptyText>No active writing sessions yet.</EmptyText>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle title="Recent activity" hint="Latest changes" />
        {localData.recentActivity.length ? (
          <div className="space-y-2">
            {localData.recentActivity.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={`/projects/${item.project_id}`}
                className="flex items-start justify-between gap-4 rounded-[24px] border border-line px-4 py-3 transition duration-150 hover:border-note-purple hover:bg-brand-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{item.message}</p>
                </div>
                <p className="shrink-0 text-xs font-semibold text-ink-soft">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyText>No activity yet.</EmptyText>
        )}
      </section>
    </div>
  );
}

function CompactProjectCard({ project }: { project: Project }) {
  const [localProject, setLocalProject] = useState(project);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const theme = CARD_THEMES[
    getProjectCardThemeName({
      overall_status: localProject.overall_status,
      submission_done: localProject.submission_done,
      hasUrgentRisk: localProject.overall_status === "overdue",
      hasDeadlineRisk: localProject.overall_status !== "in_progress"
    })
  ];
  const progressState = getProjectProgressState(localProject);

  return (
    <div className={`rounded-[28px] p-4 ${theme.card}`}>
      <Link href={`/projects/${localProject.id}`} className="block transition duration-150 hover:scale-[1.01]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs font-bold uppercase tracking-[0.14em] ${theme.eyebrow}`}>{getDeadlineLabel(localProject)}</p>
            <p className={`mt-2 truncate text-lg font-black tracking-[-0.03em] ${theme.textPrimary}`}>{localProject.title}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${theme.statusPill}`}>{localProject.overall_status.replace("_", " ")}</span>
        </div>

        <div className={`mt-4 rounded-[20px] px-4 py-4 ${theme.surfaceSoft}`}>
          <ProgressBar value={progressState.progressPercent} tone={theme.progressTone} />
        </div>
      </Link>

      <ProjectInlineEditor
        project={localProject}
        className="mt-4"
        onProjectChange={(next) => setLocalProject((current) => ({ ...current, ...next }))}
      />
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-[1.4rem] font-black tracking-[-0.04em] text-ink">{title}</h2>
      {hint ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">{hint}</p> : null}
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[24px] border border-dashed border-line px-4 py-5 text-sm font-medium text-ink-soft">{children}</p>;
}

function dedupeProjects<T extends { id: string }>(projects: T[]) {
  return Array.from(new Map(projects.map((project) => [project.id, project])).values());
}

function replaceProjectInDashboardData(data: DashboardData, project: Pick<Project, "id"> & Partial<Project>): DashboardData {
  const replace = <T extends { id: string }>(items: T[]) =>
    items.map((item) => (item.id === project.id ? ({ ...item, ...project } as T) : item));

  return {
    ...data,
    overdue: replace(data.overdue),
    dueSoon: replace(data.dueSoon),
    inProgress: replace(data.inProgress),
    recent: replace(data.recent),
    deadlineRisks: data.deadlineRisks.map((entry) =>
      entry.project.id === project.id ? { ...entry, project: { ...entry.project, ...project } } : entry
    )
  };
}
