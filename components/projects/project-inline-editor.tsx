"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
import type { OverallStatus, Project, StageStatus } from "@/types/project";

const STAGE_ORDER: StageStatus[] = ["not_started", "in_progress", "completed"];

type EditableProject = Pick<
  Project,
  | "id"
  | "due_at"
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

  const stagePills: { key: keyof Pick<Project, "syllable_status" | "chorus_status" | "verse_status">; label: string }[] = [
    { key: "syllable_status", label: "Syllable" },
    { key: "chorus_status", label: "Chorus" },
    { key: "verse_status", label: "Lyrics" }
  ];

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
      <div className="grid grid-cols-3 gap-2">
        {stagePills.map((stage) => (
          <button
            key={stage.key}
            type="button"
            disabled={isPending}
            onClick={() =>
              submit({ [stage.key]: getNextStageStatus(progressState.stages[stage.key]) } as Partial<EditableProject>)
            }
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-bold transition active:scale-[0.98]",
              getStagePillClass(progressState.stages[stage.key], theme),
              isPending && "opacity-70"
            )}
          >
            {stage.label}
          </button>
        ))}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            disabled={isPending || !canSubmit}
            className={cn(
              "min-h-12 w-full text-sm font-bold",
              localProject.submission_done
                ? "bg-note-green text-ink hover:bg-note-green"
                : canSubmit
                  ? theme.button
                  : "bg-black/10 text-ink-soft hover:bg-black/10"
            )}
          >
            {localProject.submission_done ? "Submitted" : isPending ? "Submitting..." : "Submit"}
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

      {!localProject.submission_done && !canSubmit ? (
        <p className="text-center text-[11px] font-semibold text-ink-soft">Complete all stages to enable Submit.</p>
      ) : null}
    </div>
  );
}

function getNextStageStatus(status: StageStatus): StageStatus {
  const index = STAGE_ORDER.indexOf(status);
  return STAGE_ORDER[(index + 1) % STAGE_ORDER.length];
}

function getStagePillClass(status: StageStatus, theme: (typeof CARD_THEMES)[keyof typeof CARD_THEMES]) {
  if (status === "completed") return theme.stageDone;
  if (status === "in_progress") return theme.stageActive;
  return theme.stageIdle;
}

function applyOptimisticProject(project: EditableProject, patch: Partial<EditableProject>): EditableProject {
  const next = { ...project, ...patch };
  const progressPercent = getProjectProgressState(next).progressPercent;
  const overallStatus = deriveProjectStatus({
    submission_done: next.submission_done,
    due_at: next.due_at,
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
