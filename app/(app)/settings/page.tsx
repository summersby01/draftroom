import type { ComponentType } from "react";
import { CalendarClock, Flame, LogOut, Mail, MoonStar, Sparkles, TimerReset } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { ProfilePreferences } from "@/components/settings/profile-preferences";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getProfileData } from "@/lib/data/profile";

export default async function SettingsPage() {
  const { summary, insights, recentActivity } = await getProfileData();

  return (
    <div className="space-y-4">
      <Card className="rounded-[32px] border border-line bg-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-deep-blue text-lg font-black text-white">
              {summary.email.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">Profile</p>
              <p className="mt-1 truncate text-lg font-black tracking-[-0.03em] text-ink">{summary.email}</p>
              <p className="mt-1 text-sm text-ink-soft">{summary.signInMethod}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <StatPill label="Total submitted" value={String(summary.totalSubmissions)} />
            <StatPill label="This month" value={String(summary.submissionsThisMonth)} />
            <StatPill label="Streak" value={`${insights.currentStreak}d`} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border border-line bg-white">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Insights</h2>
        </CardHeader>
        <CardContent className="space-y-1">
          <InsightRow icon={CalendarClock} label="Busiest day" value={insights.busiestDayOfWeek} />
          <InsightRow icon={TimerReset} label="Average completion" value={`${insights.averageCompletionDays} days`} />
          <InsightRow icon={MoonStar} label="Most active work period" value={insights.mostActiveWorkPeriod} />
          <InsightRow icon={Sparkles} label="Recent 7-day activity" value={`${insights.recentSevenDayActivityCount} active days`} />
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border border-line bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Mini activity</h2>
              <p className="text-sm text-ink-soft">Your last 14 days at a glance.</p>
            </div>
            <div className="rounded-full bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink-soft">
              {insights.longestStreak}d best
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {recentActivity.map((day) => (
              <div key={day.date} className="space-y-1 text-center">
                <div
                  className={[
                    "h-9 rounded-2xl border transition duration-150",
                    day.level === 0 && "border-line bg-gray-100",
                    day.level === 1 && "border-[rgba(74,111,165,0.14)] bg-[rgba(74,111,165,0.12)]",
                    day.level === 2 && "border-[rgba(74,111,165,0.2)] bg-[rgba(74,111,165,0.22)]",
                    day.level === 3 && "border-blue-muted/40 bg-blue-muted/40",
                    day.level === 4 && "border-deep-blue bg-deep-blue",
                    day.isToday && "ring-2 ring-action/25"
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  title={`${day.date}: ${day.count} activity`}
                />
                <p className="text-[10px] font-semibold text-ink-soft">{day.date.slice(8)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MiniMetric label="Current streak" value={`${insights.currentStreak} days`} />
            <MiniMetric label="Longest streak" value={`${insights.longestStreak} days`} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border border-line bg-white">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Preferences</h2>
        </CardHeader>
        <CardContent>
          <ProfilePreferences />
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border border-line bg-white">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Account</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-hidden rounded-[24px] border border-line bg-white">
            <AccountRow icon={Mail} label="Email" value={summary.email} />
            <AccountRow icon={Flame} label="Sign-in method" value={summary.signInMethod} />
          </div>

          <form action={signOut}>
            <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-action px-4 py-3 text-sm font-semibold text-white transition duration-150 hover:bg-brand-600 hover:scale-[1.01] active:scale-[0.98]">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-surface-soft px-3 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">{label}</p>
      <p className="mt-1 text-xl font-black tracking-[-0.03em] text-ink">{value}</p>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-soft">
          <Icon className="h-4 w-4 text-blue-muted" />
        </div>
        <span className="text-sm font-semibold text-ink">{label}</span>
      </div>
      <span className="text-sm text-ink-soft">{value}</span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-surface-soft px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">{label}</p>
      <p className="mt-1 text-base font-bold text-ink">{value}</p>
    </div>
  );
}

function AccountRow({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 text-blue-muted" />
        <span className="text-sm font-semibold text-ink">{label}</span>
      </div>
      <span className="truncate text-sm text-ink-soft">{value}</span>
    </div>
  );
}

