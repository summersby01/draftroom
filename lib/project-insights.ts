import {
  eachDayOfInterval,
  differenceInCalendarDays,
  differenceInDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfToday,
  startOfWeek
} from "date-fns";

import type {
  ActivityMessage,
  ArchiveActivityData,
  ArchiveActivityDay,
  ArchiveStats,
  DeadlineRiskType,
  DashboardStats,
  Project,
  ProjectHistory,
  ProjectRisk
} from "@/types/project";
import { getProjectDueDateTime, getProjectProgressState } from "@/lib/project-status";
import { toKstDateKey } from "@/lib/timezone";

const RISK_PRIORITY: DeadlineRiskType[] = ["overdue", "at_risk", "due_today", "collision", "due_soon"];

export function getDeadlineLabel(project: Pick<Project, "due_at" | "submission_done"> & { due_time?: string | null }) {
  if (project.submission_done) return "Submitted";

  const dueDate = getProjectDueDateTime(project);
  const now = new Date();
  const days = differenceInCalendarDays(dueDate, startOfToday());

  if (project.due_time && dueDate < now) return "Overdue";
  if (dueDate < now && days <= 0) return "Overdue";
  if (days === 0) return "Due Today";
  return `D-${days}`;
}

export function getProjectRisks(project: Project, activeProjects: Project[]): ProjectRisk[] {
  if (project.submission_done) return [];

  const today = startOfToday();
  const dueDate = getProjectDueDateTime(project);
  const days = differenceInCalendarDays(dueDate, today);
  const risks: ProjectRisk[] = [];

  const { progressPercent } = getProjectProgressState(project);

  if (project.due_time && dueDate < new Date()) {
    risks.push({ type: "overdue", label: "Overdue", tone: "red" });
  } else if (days < 0) {
    risks.push({ type: "overdue", label: "Overdue", tone: "red" });
  } else if (days === 0) {
    risks.push({ type: "due_today", label: "Due today", tone: "amber" });
  } else if (days <= 3) {
    risks.push({ type: "due_soon", label: "Due soon", tone: "navy" });
  }

  if (days <= 2 && progressPercent <= 33) {
    risks.push({ type: "at_risk", label: "At risk", tone: "red" });
  }

  if (hasCollisionRisk(project, activeProjects)) {
    risks.push({ type: "collision", label: "Deadline collision", tone: "plum" });
  }

  return risks.sort((a, b) => RISK_PRIORITY.indexOf(a.type) - RISK_PRIORITY.indexOf(b.type));
}

export function getRiskProjects(projects: Project[]) {
  const activeProjects = projects.filter((project) => !project.submission_done);

  return activeProjects
    .map((project) => ({
      project,
      risks: getProjectRisks(project, activeProjects)
    }))
    .filter((entry) => entry.risks.length > 0)
    .sort((a, b) => {
      const aPriority = RISK_PRIORITY.indexOf(a.risks[0].type);
      const bPriority = RISK_PRIORITY.indexOf(b.risks[0].type);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return getProjectDueDateTime(a.project).getTime() - getProjectDueDateTime(b.project).getTime();
    });
}

export function getDashboardStats(activeProjects: Project[], submittedThisMonth: Project[]): DashboardStats {
  const riskProjects = getRiskProjects(activeProjects);

  return {
    inProgressCount: activeProjects.filter((project) => project.overall_status === "in_progress").length,
    dueTodayCount: riskProjects.filter((entry) => entry.risks.some((risk) => risk.type === "due_today")).length,
    dueSoonCount: riskProjects.filter((entry) => entry.risks.some((risk) => ["due_soon", "due_today", "at_risk"].includes(risk.type))).length,
    overdueCount: riskProjects.filter((entry) => entry.risks.some((risk) => risk.type === "overdue")).length,
    submittedThisMonthCount: submittedThisMonth.length
  };
}

export function getArchiveStats(submittedProjects: Project[], now = new Date()): ArchiveStats {
  const year = format(now, "yyyy");
  const completionDurations = submittedProjects
    .filter((project) => project.submitted_at)
    .map((project) => differenceInDays(parseISO(project.submitted_at as string), parseISO(project.received_at)));
  const acceptedCount = submittedProjects.filter((project) => project.is_accepted).length;

  return {
    totalSubmitted: submittedProjects.length,
    submittedThisYear: submittedProjects.filter((project) => project.submitted_at?.startsWith(year)).length,
    averageCompletionDays: completionDurations.length
      ? Math.round(completionDurations.reduce((sum, value) => sum + value, 0) / completionDurations.length)
      : 0,
    acceptedCount,
    acceptanceRate: submittedProjects.length ? Math.round((acceptedCount / submittedProjects.length) * 100) : 0,
    portfolioCount: submittedProjects.filter((project) => project.is_portfolio && project.is_accepted).length
  };
}

const STAGE_SCORES = {
  not_started: 0,
  in_progress: 0.5,
  completed: 1
} as const;

export function getStageProgressDelta(history: Pick<ProjectHistory, "action_type" | "old_value" | "new_value">) {
  if (history.action_type !== "stage_updated") return 0;

  const oldScore = STAGE_SCORES[history.old_value as keyof typeof STAGE_SCORES] ?? 0;
  const newScore = STAGE_SCORES[history.new_value as keyof typeof STAGE_SCORES] ?? 0;
  const delta = Math.max(0, newScore - oldScore);

  return delta;
}

export function buildArchiveActivityData({
  month,
  submittedProjects,
  historyEntries,
  projectTitles
}: {
  month: Date;
  submittedProjects: Project[];
  historyEntries: ProjectHistory[];
  projectTitles: Map<string, string>;
}): ArchiveActivityData {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const submittedByDate = new Map<string, number>();
  const submittedProjectsByDate = new Map<
    string,
    { id: string; title: string; submittedAt: string }[]
  >();
  submittedProjects.forEach((project) => {
    if (!project.submitted_at) return;
    const key = toKstDateKey(project.submitted_at);
    submittedByDate.set(key, (submittedByDate.get(key) ?? 0) + 1);
    const items = submittedProjectsByDate.get(key) ?? [];
    items.push({
      id: project.id,
      title: project.title,
      submittedAt: project.submitted_at
    });
    submittedProjectsByDate.set(key, items);
  });

  if (process.env.NODE_ENV !== "production") {
    console.info(
      "[Archive Activity] submitted projects",
      submittedProjects.map((project) => ({
        id: project.id,
        title: project.title,
        submission_done: project.submission_done,
        submitted_at: project.submitted_at,
        submitted_kst_date: project.submitted_at ? toKstDateKey(project.submitted_at) : null
      }))
    );
  }

  const progressByDate = new Map<string, number>();
  const changeCountByDate = new Map<string, number>();
  const progressChangesByDate = new Map<
    string,
    {
      id: string;
      projectId: string;
      title: string;
      fieldName: string;
      oldValue: string | null;
      newValue: string | null;
      createdAt: string;
      progressUnits: number;
      message: string;
    }[]
  >();

  historyEntries.forEach((entry) => {
    const delta = getStageProgressDelta(entry);
    if (!delta) return;
    const key = toKstDateKey(entry.created_at);
    progressByDate.set(key, roundProgressUnits((progressByDate.get(key) ?? 0) + delta));
    changeCountByDate.set(key, (changeCountByDate.get(key) ?? 0) + 1);

    const projectTitle = projectTitles.get(entry.project_id) ?? "Untitled project";
    const changes = progressChangesByDate.get(key) ?? [];
    changes.push({
      id: entry.id,
      projectId: entry.project_id,
      title: projectTitle,
      fieldName: humanizeField(entry.field_name ?? "stage"),
      oldValue: entry.old_value,
      newValue: entry.new_value,
      createdAt: entry.created_at,
      progressUnits: delta,
      message: `${humanizeField(entry.field_name ?? "stage")} moved from ${formatHistoryValue(entry.old_value)} to ${formatHistoryValue(entry.new_value)}`
    });
    progressChangesByDate.set(key, changes);
  });

  const days: ArchiveActivityDay[] = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  }).map((date) => {
    const key = toKstDateKey(date);
    return {
      date: key,
      dayOfMonth: Number(format(date, "d")),
      isCurrentMonth: date >= monthStart && date <= monthEnd,
      submittedCount: submittedByDate.get(key) ?? 0,
      progressUnits: progressByDate.get(key) ?? 0,
      changeCount: changeCountByDate.get(key) ?? 0,
      activityLevel: roundProgressUnits((submittedByDate.get(key) ?? 0) + (progressByDate.get(key) ?? 0)),
      submittedProjects: submittedProjectsByDate.get(key) ?? [],
      progressChanges: progressChangesByDate.get(key) ?? []
    };
  });

  if (process.env.NODE_ENV !== "production") {
    console.info("[Archive Activity] submittedByDate", Object.fromEntries(submittedByDate));
    console.info(
      "[Archive Activity] calendar day keys",
      days.filter((day) => day.isCurrentMonth).map((day) => ({
        date: day.date,
        submittedCount: day.submittedCount
      }))
    );
  }

  const submissionsThisMonth = submittedProjects.length;
  const currentMonthDays = days.filter((day) => day.isCurrentMonth);
  const totalProgressActivityThisMonth = roundProgressUnits(
    currentMonthDays.reduce((sum, day) => sum + day.progressUnits, 0)
  );
  const busiestDay = currentMonthDays
    .filter((day) => day.activityLevel > 0)
    .sort((a, b) => {
      if (b.activityLevel !== a.activityLevel) return b.activityLevel - a.activityLevel;
      if (b.submittedCount !== a.submittedCount) return b.submittedCount - a.submittedCount;
      return b.progressUnits - a.progressUnits;
    })[0];

  return {
    month: format(monthStart, "yyyy-MM"),
    monthLabel: format(monthStart, "MMMM yyyy"),
    days,
    maxSubmittedCount: Math.max(0, ...days.map((day) => day.submittedCount)),
    maxProgressUnits: Math.max(0, ...days.map((day) => day.progressUnits)),
    maxActivityLevel: Math.max(0, ...days.map((day) => day.activityLevel)),
    summary: {
      submissionsThisMonth,
      totalProgressActivityThisMonth,
      busiestDay: busiestDay
        ? {
            date: busiestDay.date,
            label: format(parseISO(busiestDay.date), "MMM d"),
            submittedCount: busiestDay.submittedCount,
            progressUnits: busiestDay.progressUnits,
            changeCount: busiestDay.changeCount
          }
        : null
    }
  };
}

export function formatHistoryMessage(history: ProjectHistory, projectTitle: string): ActivityMessage {
  const field = history.field_name ? humanizeField(history.field_name) : null;

  const messages: Record<ProjectHistory["action_type"], string> = {
    project_created: `Created ${projectTitle}`,
    project_updated: field
      ? `Updated ${field}${history.new_value ? ` to ${formatHistoryValue(history.new_value)}` : ""}`
      : `Updated ${projectTitle}`,
    stage_updated: field
      ? `${field} changed from ${formatHistoryValue(history.old_value)} to ${formatHistoryValue(history.new_value)}`
      : "Updated writing stage",
    due_date_changed: `Due date moved from ${formatHistoryValue(history.old_value)} to ${formatHistoryValue(history.new_value)}`,
    submission_marked: "Marked as submitted",
    submission_unmarked: "Reopened submission",
    note_updated: history.new_value ? "Updated project notes" : "Cleared project notes"
  };

  return {
    id: history.id,
    project_id: history.project_id,
    title: projectTitle,
    message: messages[history.action_type],
    created_at: history.created_at
  };
}

function hasCollisionRisk(project: Project, activeProjects: Project[]) {
  const sameDueDateCount = activeProjects.filter(
    (item) => item.due_at === project.due_at && (item.due_time ?? null) === (project.due_time ?? null)
  ).length;
  if (sameDueDateCount > 1) return true;

  const dueDate = getProjectDueDateTime(project);
  const clustered = activeProjects.filter((item) => {
    const itemDate = getProjectDueDateTime(item);
    return Math.abs(differenceInCalendarDays(itemDate, dueDate)) <= 7;
  });

  return clustered.length >= 4;
}

function humanizeField(field: string) {
  const labels: Record<string, string> = {
    title: "title",
    artist: "artist",
    client: "client",
    project_type: "project type",
    due_at: "due date",
    due_time: "due time",
    received_at: "received date",
    notes: "notes",
    submission_done: "submission",
    syllable_status: "syllable planning",
    chorus_status: "chorus writing",
    verse_status: "remaining lyrics"
  };

  return labels[field] ?? field.replace(/_/g, " ");
}

function formatHistoryValue(value: string | null) {
  if (!value) return "empty";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return format(parseISO(value), "MMM d, yyyy");
  }
  if (value === "not_started") return "Not started";
  if (value === "in_progress") return "In progress";
  if (value === "completed") return "Completed";
  return value;
}

function roundProgressUnits(value: number) {
  return Number(value.toFixed(1));
}

export function isDueToday(project: Pick<Project, "due_at"> & { due_time?: string | null }) {
  return isSameDay(getProjectDueDateTime(project), startOfToday());
}
