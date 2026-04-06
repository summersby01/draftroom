import { differenceInCalendarDays, differenceInDays, parseISO } from "date-fns";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStageProgressDelta } from "@/lib/project-insights";
import { toKstDateKey, toKstMonthKey } from "@/lib/timezone";
import type { Project, ProjectHistory } from "@/types/project";

type ProfileSummary = {
  email: string;
  signInMethod: string;
  totalSubmissions: number;
  submissionsThisMonth: number;
};

type ProfileInsights = {
  currentStreak: number;
  longestStreak: number;
  busiestDayOfWeek: string;
  averageCompletionDays: number;
  mostActiveWorkPeriod: string;
  recentSevenDayActivityCount: number;
};

export type ProfileData = {
  summary: ProfileSummary;
  insights: ProfileInsights;
  recentActivity: {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
    isToday: boolean;
  }[];
};

export async function getProfileData(): Promise<ProfileData> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [submittedRes, historyRes] = await Promise.all([
    supabase.from("projects").select("*").eq("submission_done", true).order("submitted_at", { ascending: false }),
    supabase
      .from("project_history")
      .select("*")
      .eq("action_type", "stage_updated")
      .in("field_name", ["syllable_status", "chorus_status", "verse_status"])
      .order("created_at", { ascending: false })
  ]);

  if (submittedRes.error) throw new Error(submittedRes.error.message);
  if (historyRes.error && !isMissingProjectHistoryTableError(historyRes.error)) {
    throw new Error(historyRes.error.message);
  }

  const submittedProjects = (submittedRes.data ?? []) as Project[];
  const historyEntries = isMissingProjectHistoryTableError(historyRes.error)
    ? []
    : ((historyRes.data ?? []) as ProjectHistory[]);

  const now = new Date();
  const currentMonthKey = toKstMonthKey(now);

  return {
    summary: {
      email: user.email ?? "No email",
      signInMethod: getSignInMethodLabel(user.app_metadata?.provider),
      totalSubmissions: submittedProjects.length,
      submissionsThisMonth: submittedProjects.filter(
        (project) => project.submitted_at && toKstMonthKey(project.submitted_at) === currentMonthKey
      ).length
    },
    insights: {
      currentStreak: getCurrentStreak(submittedProjects, historyEntries, now),
      longestStreak: getLongestStreak(submittedProjects, historyEntries),
      busiestDayOfWeek: getBusiestDayOfWeek(submittedProjects, historyEntries),
      averageCompletionDays: getAverageCompletionDays(submittedProjects),
      mostActiveWorkPeriod: getMostActiveWorkPeriod(submittedProjects, historyEntries),
      recentSevenDayActivityCount: getRecentSevenDayActivityCount(submittedProjects, historyEntries, now)
    },
    recentActivity: getRecentActivitySeries(submittedProjects, historyEntries, now)
  };
}

function getAverageCompletionDays(submittedProjects: Project[]) {
  const completionDurations = submittedProjects
    .filter((project) => project.submitted_at)
    .map((project) => differenceInDays(parseISO(project.submitted_at as string), parseISO(project.received_at)));

  if (!completionDurations.length) return 0;

  return Math.round(completionDurations.reduce((sum, value) => sum + value, 0) / completionDurations.length);
}

function getCurrentStreak(submittedProjects: Project[], historyEntries: ProjectHistory[], now: Date) {
  const activityDates = getActivityDateKeys(submittedProjects, historyEntries);
  if (!activityDates.size) return 0;

  let streak = 0;
  let cursor = now;

  while (activityDates.has(toKstDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }

  return streak;
}

function getLongestStreak(submittedProjects: Project[], historyEntries: ProjectHistory[]) {
  const sortedDates = Array.from(getActivityDateKeys(submittedProjects, historyEntries)).sort();
  if (!sortedDates.length) return 0;

  let longest = 1;
  let current = 1;

  for (let index = 1; index < sortedDates.length; index += 1) {
    const previous = parseISO(sortedDates[index - 1]);
    const next = parseISO(sortedDates[index]);

    if (differenceInCalendarDays(next, previous) === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function getBusiestDayOfWeek(submittedProjects: Project[], historyEntries: ProjectHistory[]) {
  const weekdayCounts = new Map<string, number>([
    ["Sunday", 0],
    ["Monday", 0],
    ["Tuesday", 0],
    ["Wednesday", 0],
    ["Thursday", 0],
    ["Friday", 0],
    ["Saturday", 0]
  ]);

  submittedProjects.forEach((project) => {
    if (!project.submitted_at) return;
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      weekday: "long"
    }).format(new Date(project.submitted_at));
    weekdayCounts.set(label, (weekdayCounts.get(label) ?? 0) + 1);
  });

  historyEntries.forEach((entry) => {
    if (!getStageProgressDelta(entry)) return;
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      weekday: "long"
    }).format(new Date(entry.created_at));
    weekdayCounts.set(label, (weekdayCounts.get(label) ?? 0) + 1);
  });

  return Array.from(weekdayCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";
}

function getActivityDateKeys(submittedProjects: Project[], historyEntries: ProjectHistory[]) {
  const dateKeys = new Set<string>();

  submittedProjects.forEach((project) => {
    if (!project.submitted_at) return;
    dateKeys.add(toKstDateKey(project.submitted_at));
  });

  historyEntries.forEach((entry) => {
    if (!getStageProgressDelta(entry)) return;
    dateKeys.add(toKstDateKey(entry.created_at));
  });

  return dateKeys;
}

function getRecentSevenDayActivityCount(submittedProjects: Project[], historyEntries: ProjectHistory[], now: Date) {
  const nowKey = toKstDateKey(now);
  const nowDate = parseISO(nowKey);

  return Array.from(getActivityDateKeys(submittedProjects, historyEntries)).filter((dateKey) => {
    const date = parseISO(dateKey);
    const diff = differenceInCalendarDays(nowDate, date);
    return diff >= 0 && diff < 7;
  }).length;
}

function getRecentActivitySeries(submittedProjects: Project[], historyEntries: ProjectHistory[], now: Date) {
  const countByDate = new Map<string, number>();

  submittedProjects.forEach((project) => {
    if (!project.submitted_at) return;
    const key = toKstDateKey(project.submitted_at);
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
  });

  historyEntries.forEach((entry) => {
    const delta = getStageProgressDelta(entry);
    if (!delta) return;
    const key = toKstDateKey(entry.created_at);
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
  });

  const keys: string[] = [];
  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    keys.push(toKstDateKey(date));
  }

  const maxCount = Math.max(0, ...keys.map((key) => countByDate.get(key) ?? 0));

  return keys.map((key) => {
    const count = countByDate.get(key) ?? 0;
    return {
      date: key,
      count,
      level: getActivityLevel(count, maxCount),
      isToday: key === toKstDateKey(now)
    };
  });
}

function getActivityLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (!count || !maxCount) return 0;
  const ratio = count / maxCount;
  if (ratio >= 0.85) return 4;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.35) return 2;
  return 1;
}

function getMostActiveWorkPeriod(submittedProjects: Project[], historyEntries: ProjectHistory[]) {
  const buckets = new Map<string, number>([
    ["Morning", 0],
    ["Afternoon", 0],
    ["Evening", 0],
    ["Late night", 0]
  ]);

  const register = (value: string) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      hour: "numeric",
      hour12: false
    }).formatToParts(new Date(value));
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");

    const bucket =
      hour < 6 ? "Late night" : hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  };

  submittedProjects.forEach((project) => {
    if (project.submitted_at) register(project.submitted_at);
  });

  historyEntries.forEach((entry) => {
    if (getStageProgressDelta(entry)) register(entry.created_at);
  });

  return Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No pattern yet";
}

function getSignInMethodLabel(provider: unknown) {
  if (provider === "google") return "Google";
  if (provider === "email") return "Email magic link";
  return "Supabase Auth";
}

function isMissingProjectHistoryTableError(error: { message?: string; code?: string } | null) {
  if (!error) return false;

  return (
    error.code === "PGRST205" ||
    error.message?.includes("public.project_history") === true ||
    error.message?.includes("schema cache") === true
  );
}
