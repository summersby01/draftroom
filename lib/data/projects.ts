import { redirect } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";

import { formatHistoryMessage, getArchiveStats, getDashboardStats, getRiskProjects } from "@/lib/project-insights";
import { createClient } from "@/lib/supabase/server";
import { getMonthWindow } from "@/lib/project-status";
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

  if (error) throw new Error(error.message);
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
  if (historyRes.error) throw new Error(historyRes.error.message);
  if (allSubmittedRes.error) throw new Error(allSubmittedRes.error.message);

  const active = (activeRes.data ?? []) as Project[];
  const recent = (recentRes.data ?? []) as Project[];
  const submittedThisMonth = (submittedRes.data ?? []) as Project[];
  const history = (historyRes.data ?? []) as ProjectHistory[];
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

export async function getArchiveData(filters: ProjectFilters = {}) {
  const projects = await getProjects({
    ...filters,
    submitted: "yes",
    archivedOnly: true,
    sort: filters.sort ?? "created_at",
    direction: filters.direction ?? "desc"
  });

  return {
    projects,
    stats: getArchiveStats(projects)
  };
}
