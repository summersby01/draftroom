import {
  differenceInCalendarDays,
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

export function calculateProgressPercent(project: Pick<Project, "syllable_status" | "chorus_status" | "verse_status">) {
  const score =
    STAGE_SCORES[project.syllable_status] +
    STAGE_SCORES[project.chorus_status] +
    STAGE_SCORES[project.verse_status];

  return Math.round((score / 3) * 100);
}

export function deriveProjectStatus(
  project: Pick<
    Project,
    "submission_done" | "due_at" | "overall_status" | "syllable_status" | "chorus_status" | "verse_status"
  >
): OverallStatus {
  if (project.submission_done) return "submitted";
  if (project.overall_status === "on_hold") return "on_hold";

  const dueDate = parseISO(project.due_at);
  const today = new Date();

  if (isBefore(dueDate, today) && !isSameDay(dueDate, today)) {
    return "overdue";
  }

  const hasProgress = [project.syllable_status, project.chorus_status, project.verse_status].some(
    (status) => status !== "not_started"
  );

  return hasProgress ? "in_progress" : "planned";
}

export function getDueBadgeLabel(dueAt: string, submissionDone: boolean) {
  if (submissionDone) return "Submitted";

  const dueDate = parseISO(dueAt);
  const days = differenceInCalendarDays(dueDate, new Date());

  if (days < 0) return `Overdue ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  return `D-${days}`;
}

export function formatDate(date: string | null) {
  if (!date) return "Not set";
  return format(parseISO(date), "MMM d, yyyy");
}

export function getMonthWindow(date = new Date()) {
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd")
  };
}
