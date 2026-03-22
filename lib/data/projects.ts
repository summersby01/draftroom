import { redirect } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";

import {
  buildArchiveActivityData,
  formatHistoryMessage,
  getArchiveStats,
  getDashboardStats,
  getRiskProjects
} from "@/lib/project-insights";
import { createClient } from "@/lib/supabase/server";
import { getMonthWindow } from "@/lib/project-status";
import { getCurrentKstMonthKey, getUtcRangeForKstMonth, toKstMonthKey } from "@/lib/timezone";
import type { Project, ProjectFilters, ProjectHistory } from "@/types/project";

async function getAuthedSupabase() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

export async function getProjects(filters: ProjectFilters = {}) {
  const { supabase } = await getAuthedSupabase();

  let query = supabase.from("projects").select("*");

  if (filters.archivedOnly) {
    query = query.eq("submission_done", true);
  } else if (filters.submitted === "yes") {
    query = query.eq("submission_done", true);
  } else if (filters.submitted === "no") {
    query = query.eq("submission_done", false);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("overall_status", filters.status);
  }

  if (filters.type && filters.type !== "all") {
    query = query.eq("project_type", filters.type);
  }

  if (filters.year) {
    query = query
      .gte("submitted_at", `${filters.year}-01-01T00:00:00.000Z`)
      .lt("submitted_at", `${Number(filters.year) + 1}-01-01T00:00:00.000Z`);
  }

  if (filters.query) {
    const escaped = filters.query.replace(/,/g, "");
    query = query.or(`title.ilike.%${escaped}%,artist.ilike.%${escaped}%,client.ilike.%${escaped}%`);
  }

  const sort = filters.sort ?? "due_at";
  const ascending = (filters.direction ?? "asc") === "asc";
  query = query.order(sort, { ascending });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []) as Project[];
}

export async function getProjectById(id: string) {
  const { supabase } = await getAuthedSupabase();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();

  if (error) return null;
  return data as Project;
}

export async function getProjectHistory(projectId: string) {
  const { supabase } = await getAuthedSupabase();
  const { data, error } = await supabase
    .from("project_history")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    if (isMissingProjectHistoryTableError(error)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as ProjectHistory[];
}

export async function getDashboardData() {
  const { supabase } = await getAuthedSupabase();
  const { start, end } = getMonthWindow();

  const [activeRes, recentRes, submittedRes, historyRes, allSubmittedRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .neq("overall_status", "submitted")
      .order("due_at", { ascending: true }),
    supabase.from("projects").select("*").order("updated_at", { ascending: false }).limit(5),
    supabase
      .from("projects")
      .select("*")
      .eq("submission_done", true)
      .gte("submitted_at", `${start}T00:00:00.000Z`)
      .lte("submitted_at", `${end}T23:59:59.000Z`)
      .order("submitted_at", { ascending: false }),
    supabase.from("project_history").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("projects").select("*").eq("submission_done", true)
  ]);

  if (activeRes.error) throw new Error(activeRes.error.message);
  if (recentRes.error) throw new Error(recentRes.error.message);
  if (submittedRes.error) throw new Error(submittedRes.error.message);
  if (historyRes.error && !isMissingProjectHistoryTableError(historyRes.error)) {
    throw new Error(historyRes.error.message);
  }
  if (allSubmittedRes.error) throw new Error(allSubmittedRes.error.message);

  const active = (activeRes.data ?? []) as Project[];
  const recent = (recentRes.data ?? []) as Project[];
  const submittedThisMonth = (submittedRes.data ?? []) as Project[];
  const history = isMissingProjectHistoryTableError(historyRes.error)
    ? []
    : ((historyRes.data ?? []) as ProjectHistory[]);
  const allSubmitted = (allSubmittedRes.data ?? []) as Project[];

  const overdue = active.filter((project) => project.overall_status === "overdue");
  const dueSoon = active.filter((project) => {
    const days = differenceInCalendarDays(parseISO(project.due_at), new Date());
    return days >= 0 && days <= 7 && project.overall_status !== "overdue";
  });
  const inProgress = active.filter((project) => project.overall_status === "in_progress");
  const deadlineRisks = getRiskProjects(active).slice(0, 6);
  const projectsById = new Map([...active, ...recent, ...submittedThisMonth, ...allSubmitted].map((project) => [project.id, project]));
  const recentActivity = history
    .map((entry) => {
      const project = projectsById.get(entry.project_id);
      return project ? formatHistoryMessage(entry, project.title) : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return {
    overdue,
    dueSoon: dueSoon.slice(0, 5),
    inProgress: inProgress.slice(0, 5),
    submittedThisMonth,
    recent,
    recentActivity,
    deadlineRisks,
    stats: {
      activeCount: active.length,
      ...getDashboardStats(active, submittedThisMonth)
    },
    archiveStats: getArchiveStats(allSubmitted)
  };
}

function isMissingProjectHistoryTableError(error: { message?: string; code?: string } | null) {
  if (!error) return false;

  return (
    error.code === "PGRST205" ||
    error.message?.includes("public.project_history") === true ||
    error.message?.includes("schema cache") === true
  );
}

export async function getArchiveData(filters: ProjectFilters = {}) {
  const { supabase } = await getAuthedSupabase();
  const projects = await getProjects({
    ...filters,
    submitted: "yes",
    archivedOnly: true,
    sort: filters.sort ?? "created_at",
    direction: filters.direction ?? "desc"
  });
  const repairedProjects = await repairSubmittedProjects(supabase, projects);

  return {
    projects: repairedProjects,
    stats: getArchiveStats(repairedProjects)
  };
}

export async function getArchiveActivityData(month?: string) {
  const { supabase } = await getAuthedSupabase();
  const monthKey = month && /^\d{4}-\d{2}$/.test(month) ? month : getCurrentKstMonthKey();
  const selectedMonth = `${monthKey}-01`;
  const monthDate = parseISO(selectedMonth);
  const { start, endExclusive } = getUtcRangeForKstMonth(monthKey);

  const [submittedRes, historyRes, brokenSubmittedRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("submission_done", true)
      .gte("submitted_at", start)
      .lt("submitted_at", endExclusive)
      .order("submitted_at", { ascending: true }),
    supabase
      .from("project_history")
      .select("*")
      .eq("action_type", "stage_updated")
      .in("field_name", ["syllable_status", "chorus_status", "verse_status"])
      .gte("created_at", start)
      .lt("created_at", endExclusive)
      .order("created_at", { ascending: true }),
    supabase
      .from("projects")
      .select("*")
      .eq("submission_done", true)
      .is("submitted_at", null)
  ]);

  if (submittedRes.error) throw new Error(submittedRes.error.message);
  if (historyRes.error && !isMissingProjectHistoryTableError(historyRes.error)) {
    throw new Error(historyRes.error.message);
  }
  if (brokenSubmittedRes.error) throw new Error(brokenSubmittedRes.error.message);

  const submittedProjects = (submittedRes.data ?? []) as Project[];
  const historyEntries = isMissingProjectHistoryTableError(historyRes.error)
    ? []
    : ((historyRes.data ?? []) as ProjectHistory[]);
  const brokenSubmittedProjects = await repairSubmittedProjects(
    supabase,
    (brokenSubmittedRes.data ?? []) as Project[]
  );
  const repairedBrokenProjects = brokenSubmittedProjects.filter((project) => {
    if (!project.submitted_at) return false;
    return toKstMonthKey(project.submitted_at) === monthKey;
  });
  const allSubmittedProjects = dedupeProjectsById([...submittedProjects, ...repairedBrokenProjects]);

  const projectIds = Array.from(
    new Set([...allSubmittedProjects.map((project) => project.id), ...historyEntries.map((entry) => entry.project_id)])
  );

  const projectTitles = new Map<string, string>(allSubmittedProjects.map((project) => [project.id, project.title]));

  if (projectIds.length) {
    const { data: projectTitleRows, error: projectTitlesError } = await supabase
      .from("projects")
      .select("id, title")
      .in("id", projectIds);

    if (projectTitlesError) throw new Error(projectTitlesError.message);

    for (const row of (projectTitleRows ?? []) as Array<{ id: string | null; title: string | null }>) {
      if (!row.id || !row.title) continue;
      projectTitles.set(row.id, row.title);
    }
  }

  return buildArchiveActivityData({
    month: monthDate,
    submittedProjects: allSubmittedProjects,
    historyEntries,
    projectTitles
  });
}

async function repairSubmittedProjects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projects: Project[]
) {
  const brokenProjects = projects.filter((project) => project.submission_done && !project.submitted_at);
  if (!brokenProjects.length) return projects;

  const brokenIds = brokenProjects.map((project) => project.id);
  const { data: submissionHistoryRows, error } = await supabase
    .from("project_history")
    .select("project_id, created_at, action_type")
    .in("project_id", brokenIds)
    .eq("action_type", "submission_marked")
    .order("created_at", { ascending: false });

  if (error && !isMissingProjectHistoryTableError(error)) {
    throw new Error(error.message);
  }

  const historyByProjectId = new Map<string, string>();
  for (const row of (submissionHistoryRows ?? []) as Array<{
    project_id: string;
    created_at: string;
    action_type: "submission_marked";
  }>) {
    if (!historyByProjectId.has(row.project_id)) {
      historyByProjectId.set(row.project_id, row.created_at);
    }
  }

  const repaired = projects.map((project) => {
    if (!project.submission_done || project.submitted_at) return project;

    const fallbackSubmittedAt = historyByProjectId.get(project.id) ?? project.updated_at ?? project.created_at;
    return {
      ...project,
      submitted_at: fallbackSubmittedAt,
      overall_status: "submitted" as const
    };
  });

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[Draft Room] Repaired submitted projects missing submitted_at:",
      brokenProjects.map((project) => ({
        id: project.id,
        title: project.title,
        updated_at: project.updated_at,
        repaired_submitted_at: historyByProjectId.get(project.id) ?? project.updated_at ?? project.created_at
      }))
    );
  }

  return repaired;
}

function dedupeProjectsById(projects: Project[]) {
  return Array.from(new Map(projects.map((project) => [project.id, project])).values());
}
