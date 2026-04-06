import Link from "next/link";
import type { Route } from "next";
import { format, parseISO, subMonths } from "date-fns";
import { Check } from "lucide-react";

import { SummaryCard } from "@/components/dashboard/summary-card";
import { PageHeader } from "@/components/layout/page-header";
import { ArchiveProjectList } from "@/components/archive/archive-project-list";
import { ArchiveSearchFilters } from "@/components/archive/archive-search-filters";
import { PortfolioProjectList } from "@/components/archive/portfolio-project-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getArchiveActivityData, getArchiveData, getPortfolioData } from "@/lib/data/projects";
import { formatDate } from "@/lib/project-status";
import { getCurrentKstMonthKey, toKstYear } from "@/lib/timezone";
import type { ArchiveActivityData, ProjectType } from "@/types/project";

const TYPES: readonly ProjectType[] = ["lyrics", "adaptation", "ost", "idol", "topline", "other"];

export default async function ArchivePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab =
    typeof params.tab === "string" && ["projects", "activity", "portfolio"].includes(params.tab)
      ? (params.tab as "projects" | "activity" | "portfolio")
      : "projects";
  const monthParam = typeof params.month === "string" ? params.month : getCurrentKstMonthKey();
  const selectedDateParam = typeof params.selected === "string" ? params.selected : undefined;

  const [{ projects, stats }, activity, portfolio] = await Promise.all([
    getArchiveData({
      query: typeof params.query === "string" ? params.query : undefined,
      type:
        typeof params.type === "string" && TYPES.includes(params.type as ProjectType)
          ? (params.type as ProjectType)
          : "all",
      year: typeof params.year === "string" ? params.year : undefined,
      sort: "created_at",
      direction: "desc"
    }),
    getArchiveActivityData(monthParam),
    getPortfolioData()
  ]);

  const grouped = Object.entries(
    projects.reduce<Record<string, typeof projects>>((acc, project) => {
      const year = project.submitted_at ? toKstYear(project.submitted_at) : "Unknown";
      acc[year] = acc[year] ? [...acc[year], project] : [project];
      return acc;
    }, {})
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Archive"
        description="Completed songs and delivered lyric projects, plus a record of how the work stacked up over time."
      />

      <div className="grid grid-cols-3 gap-2 rounded-[24px] border border-line bg-white p-1.5">
        <ArchiveTab href={buildTabHref("projects", params, tab)} label="Projects" active={tab === "projects"} />
        <ArchiveTab href={buildTabHref("activity", params, tab)} label="Activity" active={tab === "activity"} />
        <ArchiveTab href={buildTabHref("portfolio", params, tab)} label="Portfolio" active={tab === "portfolio"} />
      </div>

      {tab === "projects" ? (
        <>
          <section className="-mx-4 overflow-x-auto px-4">
            <div className="flex gap-3 pb-1">
              <SummaryCard label="Total submitted" value={stats.totalSubmitted} hint="Projects stored in your finished catalog" tone="bg-white border-l-[6px] border-l-deep-blue" />
              <SummaryCard label="Submitted this year" value={stats.submittedThisYear} hint="Completed projects in the current year" tone="bg-white border-l-[6px] border-l-blue-muted" />
              <SummaryCard label="Average completion" value={`${stats.averageCompletionDays}d`} hint="Average days from received to submitted" tone="bg-white border-l-[6px] border-l-action" />
              <SummaryCard label="Accepted" value={stats.acceptedCount} hint={`${stats.acceptanceRate}% acceptance rate`} tone="bg-white border-l-[6px] border-l-success" />
            </div>
          </section>
          <ArchiveSearchFilters />
          <ArchiveProjectList groupedProjects={grouped} />
        </>
      ) : tab === "activity" ? (
        <ArchiveActivityView activity={activity} selectedDateParam={selectedDateParam} />
      ) : (
        <div className="space-y-5">
          <section className="-mx-4 overflow-x-auto px-4">
            <div className="flex gap-3 pb-1">
              <SummaryCard label="Portfolio count" value={portfolio.projects.length} hint="Accepted projects collected into your showcase" tone="bg-white border-l-[6px] border-l-deep-blue" />
              <SummaryCard label="Accepted total" value={portfolio.stats.acceptedCount} hint="All accepted submissions in your archive" tone="bg-white border-l-[6px] border-l-success" />
              <SummaryCard label="Acceptance rate" value={`${portfolio.stats.acceptanceRate}%`} hint="Accepted submissions across your archive" tone="bg-white border-l-[6px] border-l-action" />
            </div>
          </section>
          <PortfolioProjectList projects={portfolio.projects} />
        </div>
      )}
    </div>
  );
}

function ArchiveTab({ href, label, active }: { href: Route; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={active ? "rounded-[18px] bg-deep-blue px-4 py-3 text-center text-sm font-bold text-white" : "rounded-[18px] px-4 py-3 text-center text-sm font-bold text-ink-soft"}
    >
      {label}
    </Link>
  );
}

function ArchiveActivityView({
  activity,
  selectedDateParam
}: {
  activity: ArchiveActivityData;
  selectedDateParam?: string;
}) {
  const previousMonth = format(subMonths(new Date(`${activity.month}-01T00:00:00`), 1), "yyyy-MM");
  const nextMonth = format(subMonths(new Date(`${activity.month}-01T00:00:00`), -1), "yyyy-MM");
  const selectedDay =
    activity.days.find((day) => day.date === selectedDateParam && day.isCurrentMonth) ??
    activity.days.find((day) => day.isCurrentMonth && day.activityLevel > 0) ??
    activity.days.find((day) => day.isCurrentMonth);

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-3 gap-3">
        <MetricCard label="Submissions" value={activity.summary.submissionsThisMonth} tone="border-t-[6px] border-t-action" />
        <MetricCard
          label="Progress"
          value={`${activity.summary.totalProgressActivityThisMonth}u`}
          tone="border-t-[6px] border-t-blue-muted"
        />
        <MetricCard
          label="Busiest day"
          value={activity.summary.busiestDay?.label ?? "None"}
          hint={
            activity.summary.busiestDay
              ? `${activity.summary.busiestDay.submittedCount} submitted · ${activity.summary.busiestDay.progressUnits}u`
              : "No recorded activity"
          }
          tone="border-t-[6px] border-t-deep-blue"
        />
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">Activity</h2>
            <p className="text-sm text-ink-soft">Submitted projects and recorded progress changes by day.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={buildActivityHref({ tab: "activity", month: previousMonth })}
              className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-ink"
            >
              Prev
            </Link>
            <Link
              href={buildActivityHref({ tab: "activity", month: nextMonth })}
              className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-ink"
            >
              Next
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-bold text-ink">{activity.monthLabel}</p>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-ink-soft">
              <span className="inline-flex items-center gap-1">
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-action px-1 text-[10px] font-black text-white">
                  ✓
                </span>
                <span>submitted</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-blue-muted" />
                <span>work</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {activity.days.map((day) => (
              <Link
                key={day.date}
                href={buildActivityHref({ tab: "activity", month: activity.month, selected: day.date })}
                className={`relative min-h-[88px] overflow-visible rounded-[20px] border p-3 text-left transition duration-150 ${
                  day.isCurrentMonth
                    ? getCalendarCellClass(day, activity.maxProgressUnits, selectedDay?.date === day.date)
                    : "border-transparent bg-transparent text-ink-soft/35"
                }`}
              >
                <div className="flex flex-col items-center">
                  <p className={`text-xs font-bold ${day.isCurrentMonth ? getCalendarTextClass(day, activity.maxProgressUnits) : "text-ink-soft/40"}`}>
                    {day.dayOfMonth}
                  </p>
                  {day.submittedCount > 0 ? (
                    <div className="mt-1 inline-flex h-[15px] w-[15px] items-center justify-center rounded-full bg-action text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-[20px] bg-surface-soft p-4 text-sm text-ink-soft">
            Each day combines submitted songs and positive stage progress changes. Tap any date to inspect the exact work logged there.
          </div>
        </CardContent>
      </Card>

      <DayDetailPanel day={selectedDay} month={activity.month} />
    </div>
  );
}

function DayDetailPanel({
  day,
  month
}: {
  day: ArchiveActivityData["days"][number] | undefined;
  month: string;
}) {
  if (!day) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-ink-soft">
          No days available for {month}. Try another month to inspect archive activity.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-ink">{format(parseISO(day.date), "EEEE, MMM d")}</h3>
            <p className="text-sm text-ink-soft">
              {day.submittedCount} submitted · {formatProgressUnits(day.progressUnits)} progress units · {day.changeCount} changes
            </p>
          </div>
          <div className="rounded-full bg-action px-3 py-1.5 text-xs font-bold text-white">
            {day.activityLevel > 0 ? "Active day" : "No activity"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Submitted projects</p>
          {day.submittedProjects.length ? (
            <div className="space-y-2">
              {day.submittedProjects.map((project) => (
                <div key={project.id} className="rounded-[18px] border border-line bg-white p-3">
                  <p className="text-sm font-bold text-ink">{project.title}</p>
                  <p className="mt-1 text-xs text-ink-soft">Submitted {formatDate(project.submittedAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-line bg-white p-3 text-sm text-ink-soft">
              No projects were submitted on this date.
            </div>
          )}
        </section>

        <section className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Progress changes</p>
          {day.progressChanges.length ? (
            <div className="space-y-2">
              {day.progressChanges.map((change) => (
                <div key={change.id} className="rounded-[18px] border border-line bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{change.title}</p>
                      <p className="mt-1 text-sm text-ink-soft">{change.message}</p>
                    </div>
                    <div className="shrink-0 rounded-full bg-blue-muted px-2.5 py-1 text-xs font-bold text-white">
                      +{formatProgressUnits(change.progressUnits)}u
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-line bg-white p-3 text-sm text-ink-soft">
              No stage progress was recorded on this date.
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className={`rounded-[22px] border border-line bg-white p-4 shadow-soft ${tone ?? ""}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

function getCalendarCellClass(
  day: ArchiveActivityData["days"][number],
  maxProgressUnits: number,
  selected: boolean
) {
  const heatClass = getWorkHeatCellClass(day.progressUnits, maxProgressUnits);

  if (selected) {
    return `${heatClass} border-deep-blue ring-2 ring-deep-blue/20 shadow-soft`;
  }

  return `${heatClass} border-line`;
}

function getCalendarTextClass(
  day: ArchiveActivityData["days"][number],
  maxProgressUnits: number
) {
  const level = getWorkHeatLevel(day.progressUnits, maxProgressUnits);
  return level >= 3 ? "text-white" : "text-ink";
}

function formatProgressUnits(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getWorkHeatCellClass(value: number, max: number) {
  const level = getWorkHeatLevel(value, max);

  if (level === 4) return "bg-blue-muted";
  if (level === 3) return "bg-[#9CCBFF]";
  if (level === 2) return "bg-[#CFE6FF]";
  if (level === 1) return "bg-[#EAF3FF]";
  return "bg-white";
}

function getWorkHeatLevel(value: number, max: number) {
  if (value <= 0 || max <= 0) return 0;

  const ratio = value / max;
  if (ratio >= 0.85) return 4;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.35) return 2;
  return 1;
}

function buildActivityHref({
  tab,
  month,
  selected
}: {
  tab: "activity";
  month: string;
  selected?: string;
}) {
  const next = new URLSearchParams();
  next.set("tab", tab);
  next.set("month", month);
  if (selected) next.set("selected", selected);
  return `?${next.toString()}` as Route;
}

function buildTabHref(
  tab: "projects" | "activity" | "portfolio",
  params: Record<string, string | string[] | undefined>,
  currentTab: "projects" | "activity" | "portfolio"
) {
  const next = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value !== "string") return;
    if (key === "tab") return;
    if (key === "selected") return;
    if (key === "month") {
      const shouldPreserveMonth = currentTab === "activity" && tab === "activity" && /^\d{4}-\d{2}$/.test(value);
      if (!shouldPreserveMonth) return;
    }
    next.set(key, value);
  });

  next.set("tab", tab);
  return `?${next.toString()}` as Route;
}
