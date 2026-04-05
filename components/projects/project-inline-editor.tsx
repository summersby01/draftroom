"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowRight, Check, Circle } from "lucide-react";
import { toast } from "sonner";

import { updateProjectInline } from "@/app/actions/projects";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { CARD_THEMES, getProjectCardThemeName } from "@/lib/card-themes";
import { cn } from "@/lib/utils";
import { deriveProjectStatus, getProjectProgressState, normalizeStageStatus } from "@/lib/project-status";
import type { OverallStatus, Project } from "@/types/project";

type EditableProject = Pick<
  Project,
  | "id"
  | "due_at"
  | "due_time"
  | "overall_status"
  | "submission_done"
  | "syllable_status"
  | "chorus_status"
  | "verse_status"
  | "progress_percent"
>;

export function ProjectInlineEditor({
  project,
  className,
  onProjectChange
}: {
  project: EditableProject;
  className?: string;
  onProjectChange?: (project: EditableProject) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localProject, setLocalProject] = useState(project);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const theme = CARD_THEMES[
    getProjectCardThemeName({
      overall_status: localProject.overall_status,
      submission_done: localProject.submission_done
    })
  ];
  const progressState = getProjectProgressState(localProject);
  const canSubmit = progressState.canSubmit && !localProject.submission_done;
  const stageOverview = getStageOverview(progressState.stages);
  const nextStage = getNextActionableStage(progressState.stages);

  const submit = (patch: Partial<EditableProject>) => {
    const previous = localProject;
    const optimistic = applyOptimisticProject(localProject, patch);
    setLocalProject(optimistic);
    onProjectChange?.(optimistic);

    startTransition(async () => {
      try {
        const updated = await updateProjectInline(localProject.id, patch);
        const nextProgressState = getProjectProgressState(updated);
        const nextProject = {
          id: updated.id,
          due_at: updated.due_at,
          due_time: updated.due_time,
          overall_status: updated.overall_status,
          submission_done: updated.submission_done,
          syllable_status: updated.syllable_status,
          chorus_status: updated.chorus_status,
          verse_status: updated.verse_status,
          progress_percent: nextProgressState.progressPercent
        };
        setLocalProject(nextProject);
        onProjectChange?.(nextProject);
        if (patch.submission_done) {
          toast.success("Project submitted and moved to Archive");
        }
        router.refresh();
      } catch (error) {
        setLocalProject(previous);
        onProjectChange?.(previous);
        toast.error(error instanceof Error ? error.message : "Could not update project");
      }
    });
  };

  return (
    <div
      className={cn("space-y-3 rounded-[24px] px-3 py-3", theme.surface, className)}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">Stage flow</p>
          <p className="text-xs font-semibold text-ink-soft">{progressState.progressPercent}% complete</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stageOverview.map((stage) => (
            <div
              key={stage.label}
              className={cn(
                "min-h-11 rounded-full px-3 py-2 text-center text-[11px] font-bold",
                getStagePillClass(stage.tone, theme)
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <StageStatusIcon tone={stage.tone} />
                <span>{stage.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {nextStage ? (
        <div className="space-y-2 rounded-[20px] bg-white/75 px-4 py-3">
          <p className="text-xs font-semibold text-ink-soft">Next step: {nextStage.label}</p>
          <Button
            type="button"
            disabled={isPending}
            className={cn("min-h-12 w-full text-sm font-bold", theme.button)}
            onClick={() => submit(getStageCompletionPatch(nextStage.key))}
          >
            <span className="inline-flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              {isPending ? "Saving..." : `Complete ${nextStage.label}`}
            </span>
          </Button>
        </div>
      ) : null}

      {localProject.submission_done ? (
        <Button
          type="button"
          disabled
          className="min-h-12 w-full bg-note-green text-ink hover:bg-note-green"
        >
          Submitted
        </Button>
      ) : canSubmit ? (
        <div className="space-y-2">
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                disabled={isPending}
                className={cn(
                  "min-h-12 w-full text-sm font-bold transition-all duration-200 ease-out",
                  "bg-orange-500 text-white shadow-[0_8px_18px_rgba(249,115,22,0.28)] hover:bg-orange-600 hover:scale-[1.01] active:scale-[0.99]"
                )}
              >
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark the project as submitted and move it to Archive.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancelButton disabled={isPending}>Cancel</AlertDialogCancelButton>
                <AlertDialogAction
                  className={buttonVariants({ variant: "default" })}
                  disabled={isPending || !canSubmit}
                  onClick={() => {
                    setConfirmOpen(false);
                    submit({ submission_done: true, overall_status: "submitted" });
                  }}
                >
                  {isPending ? "Submitting..." : "Submit"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-center text-[11px] font-semibold text-orange-600">Ready to submit 🎉</p>
        </div>
      ) : (
        <Button
          type="button"
          disabled
          className="min-h-12 w-full bg-gray-200 text-gray-500 transition-colors duration-200 hover:bg-gray-200"
        >
          Submit
        </Button>
      )}
    </div>
  );
}

function getStagePillClass(
  tone: "completed" | "current" | "upcoming",
  theme: (typeof CARD_THEMES)[keyof typeof CARD_THEMES]
) {
  if (tone === "completed") return theme.stageDone;
  if (tone === "current") return theme.stageActive;
  return theme.stageIdle;
}

function getNextActionableStage(stages: ReturnType<typeof getProjectProgressState>["stages"]) {
  if (stages.syllable_status !== "completed") return { key: "syllable_status" as const, label: "Syllable" };
  if (stages.chorus_status !== "completed") return { key: "chorus_status" as const, label: "Chorus" };
  if (stages.verse_status !== "completed") return { key: "verse_status" as const, label: "Lyrics" };
  return null;
}

function getStageCompletionPatch(
  key: keyof Pick<Project, "syllable_status" | "chorus_status" | "verse_status">
): Partial<EditableProject> {
  if (key === "syllable_status") return { syllable_status: "completed" };
  if (key === "chorus_status") return { chorus_status: "completed" };
  return { verse_status: "completed" };
}

function getStageOverview(stages: ReturnType<typeof getProjectProgressState>["stages"]) {
  const nextStage = getNextActionableStage(stages)?.key;

  return [
    { label: "Syllable", key: "syllable_status" as const, status: stages.syllable_status },
    { label: "Chorus", key: "chorus_status" as const, status: stages.chorus_status },
    { label: "Lyrics", key: "verse_status" as const, status: stages.verse_status }
  ].map((stage) => ({
    ...stage,
    tone:
      stage.status === "completed"
        ? ("completed" as const)
        : stage.key === nextStage
          ? ("current" as const)
          : ("upcoming" as const)
  }));
}

function StageStatusIcon({ tone }: { tone: "completed" | "current" | "upcoming" }) {
  if (tone === "completed") {
    return <Check className="h-3.5 w-3.5" strokeWidth={3} />;
  }

  if (tone === "current") {
    return <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />;
  }

  return <Circle className="h-3.5 w-3.5" strokeWidth={2.5} />;
}

function applyOptimisticProject(project: EditableProject, patch: Partial<EditableProject>): EditableProject {
  const next = { ...project, ...patch };
  const progressPercent = getProjectProgressState(next).progressPercent;
  const overallStatus = deriveProjectStatus({
    submission_done: next.submission_done,
    due_at: next.due_at,
    due_time: next.due_time,
    overall_status: (patch.overall_status ?? next.overall_status) as OverallStatus,
    syllable_status: normalizeStageStatus(next.syllable_status),
    chorus_status: normalizeStageStatus(next.chorus_status),
    verse_status: normalizeStageStatus(next.verse_status)
  });

  return {
    ...next,
    progress_percent: progressPercent,
    overall_status: overallStatus
  };
}
