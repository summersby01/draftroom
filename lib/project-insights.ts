import {
  differenceInCalendarDays,
  differenceInDays,
  format,
  isSameDay,
  parseISO,
  startOfToday
} from "date-fns";

import type {
  ActivityMessage,
  ArchiveStats,
  DeadlineRiskType,
  DashboardStats,
  Project,
  ProjectHistory,
  ProjectRisk
} from "@/types/project";

const RISK_PRIORITY: DeadlineRiskType[] = ["overdue", "at_risk", "due_today", "collision", "due_soon"];

export function getDeadlineLabel(project: Pick<Project, "due_at" | "submission_done">) {
  if (project.submission_done) return "Submitted";

  const days = differenceInCalendarDays(parseISO(project.due_at), startOfToday());
  if (days < 0) return `Overdue ${Math.abs(days)}d`;
  if (days === 0) return "Due Today";
  return `D-${days}`;
}

export function getProjectRisks(project: Project, activeProjects: Project[]): ProjectRisk[] {
  if (project.submission_done) return [];

  const today = startOfToday();
  const dueDate = parseISO(project.due_at);
  const days = differenceInCalendarDays(dueDate, today);
  const risks: ProjectRisk[] = [];

  if (days < 0) {
    risks.push({ type: "overdue", label: "Overdue", tone: "red" });
  } else if (days === 0) {
    risks.push({ type: "due_today", label: "Due today", tone: "amber" });
  } else if (days <= 3) {
    risks.push({ type: "due_soon", label: "Due soon", tone: "navy" });
  }

  if (days <= 2 && project.progress_percent <= 33) {
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
      return differenceInCalendarDays(parseISO(a.project.due_at), parseISO(b.project.due_at));
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

  return {
    totalSubmitted: submittedProjects.length,
    submittedThisYear: submittedProjects.filter((project) => project.submitted_at?.startsWith(year)).length,
    averageCompletionDays: completionDurations.length
      ? Math.round(completionDurations.reduce((sum, value) => sum + value, 0) / completionDurations.length)
      : 0
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
  const sameDueDateCount = activeProjects.filter((item) => item.due_at === project.due_at).length;
  if (sameDueDateCount > 1) return true;

  const dueDate = parseISO(project.due_at);
  const clustered = activeProjects.filter((item) => {
    const itemDate = parseISO(item.due_at);
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

export function isDueToday(project: Pick<Project, "due_at">) {
  return isSameDay(parseISO(project.due_at), startOfToday());
}
