import { DraftRoomLogo } from "@/components/layout/draft-room-logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-paper-soft">
        <CardHeader>
          <DraftRoomLogo withWordmark />
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-ink-soft">
          <p>Draft Room is built for a songwriter workflow: due dates, writing stages, archive recall, and calm daily tracking.</p>
          <p>The profile area is intentionally lightweight in this MVP. Account and archive settings can expand here next.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Profile & Settings</h1>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-ink-soft">
          <div className="rounded-2xl border border-line bg-surface-soft p-4">
            <p className="font-medium text-ink">Archive preferences</p>
            <p className="mt-1">Year filters, export tools, and writing templates can live here in a later pass.</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-soft p-4">
            <p className="font-medium text-ink">Account settings</p>
            <p className="mt-1">Supabase Auth currently handles sign-in. Profile controls can be added when needed.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
