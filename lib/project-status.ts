import {
  differenceInCalendarDays,
  differenceInMilliseconds,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth
} from "date-fns";

import type { OverallStatus, Project, StageStatus } from "@/types/project";

const STAGE_SCORES: Record<StageStatus, number> = {
  not_started: 0,
  in_progress: 0.5,
  completed: 1
};

const VALID_STAGE_STATUSES: readonly StageStatus[] = ["not_started", "in_progress", "completed"];

type StageStateInput = Pick<Project, "syllable_status" | "chorus_status" | "verse_status">;
type DueInput = Pick<Project, "due_at"> & {
  due_time?: string | null;
};

export function getStageScore(status: string | null | undefined): number {
  return STAGE_SCORES[normalizeStageStatus(status)];
}

export function calculateProgressPercent(project: StageStateInput) {
  const score = getProjectStageScore(project);
  return Math.round((score / 3) * 100);
}

export function getProjectStageScore(project: StageStateInput) {
  return (
    getStageScore(project.syllable_status) +
    getStageScore(project.chorus_status) +
    getStageScore(project.verse_status)
  );
}

export function isProjectSubmittable(project: StageStateInput) {
  return (
    normalizeStageStatus(project.syllable_status) === "completed" &&
    normalizeStageStatus(project.chorus_status) === "completed" &&
    normalizeStageStatus(project.verse_status) === "completed"
  );
}

export function getProjectProgressState(project: StageStateInput) {
  return {
    progressPercent: calculateProgressPercent(project),
    canSubmit: isProjectSubmittable(project),
    stages: {
      syllable_status: normalizeStageStatus(project.syllable_status),
      chorus_status: normalizeStageStatus(project.chorus_status),
      verse_status: normalizeStageStatus(project.verse_status)
    }
  };
}

export function normalizeStageStatus(status: string | null | undefined): StageStatus {
  if (status && VALID_STAGE_STATUSES.includes(status as StageStatus)) {
    return status as StageStatus;
  }

  if (process.env.NODE_ENV !== "production" && status !== undefined && status !== null && status !== "") {
    console.warn(`[Draft Room] Invalid stage status "${status}" received. Falling back to "not_started".`);
  }

  return "not_started";
}

export function deriveProjectStatus(
  project: Pick<Project, "submission_done" | "due_at" | "overall_status" | "syllable_status" | "chorus_status" | "verse_status"> & {
    due_time?: string | null;
  }
): OverallStatus {
  if (project.submission_done) return "submitted";
  if (project.overall_status === "on_hold") return "on_hold";

  const dueDate = getProjectDueDateTime(project);
  const now = new Date();

  if (project.due_time ? isBefore(dueDate, now) : isBefore(dueDate, now) && !isSameDay(dueDate, now)) {
    return "overdue";
  }

  const hasProgress = [project.syllable_status, project.chorus_status, project.verse_status].some(
    (status) => normalizeStageStatus(status) !== "not_started"
  );

  return hasProgress ? "in_progress" : "planned";
}

export function getDueBadgeLabel(dueAt: string, submissionDone: boolean, dueTime?: string | null) {
  if (submissionDone) return "Submitted";

  const dueDate = getProjectDueDateTime({ due_at: dueAt, due_time: dueTime ?? null });
  const now = new Date();
  const days = differenceInCalendarDays(dueDate, now);

  if (dueTime && isBefore(dueDate, now)) return "Overdue";

  if (days < 0) return `Overdue ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  return `D-${days}`;
}

export function formatDate(date: string | null) {
  if (!date) return "Not set";
  return format(parseISO(date), "MMM d, yyyy");
}

export function formatDueDateTime(project: DueInput) {
  const dueDateTime = getProjectDueDateTime(project);
  if (!project.due_time) return format(dueDateTime, "MMM d, yyyy");
  return format(dueDateTime, "MMM d, yyyy, h:mm a");
}

export function formatDueCompact(project: DueInput) {
  const dueDateTime = getProjectDueDateTime(project);
  if (!project.due_time) return format(dueDateTime, "MMM d");
  return format(dueDateTime, "MMM d, h:mm a");
}

export function getProjectDueDateTime(project: DueInput) {
  const baseDate = parseISO(project.due_at);
  if (!project.due_time) return baseDate;

  const [hours, minutes] = project.due_time.split(":").map(Number);
  const dueDateTime = new Date(baseDate);
  dueDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return dueDateTime;
}

export function compareProjectDeadlines(a: DueInput, b: DueInput) {
  return differenceInMilliseconds(getProjectDueDateTime(a), getProjectDueDateTime(b));
}

export function getMonthWindow(date = new Date()) {
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd")
  };
}
