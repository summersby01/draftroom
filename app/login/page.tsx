import type { ComponentType } from "react";
import { redirect } from "next/navigation";
import { Music4, NotebookPen } from "lucide-react";

import { signIn } from "@/app/actions/auth";
import { DraftRoomLogo } from "@/components/layout/draft-room-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) redirect("/dashboard");

  const loginError = typeof params.error === "string" ? params.error : null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <div className="space-y-5">
        <section className="space-y-4 rounded-2xl border border-line bg-paper-soft p-5 shadow-soft">
          <DraftRoomLogo withWordmark />
          <div className="inline-flex rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft">
            Mobile songwriter workspace
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink">
            A calm workspace for commissioned lyric projects and finished catalogs.
          </h1>
          <p className="text-sm leading-6 text-ink-soft">
            Track syllable planning, chorus writing, lyric delivery, and your archive without turning your studio workflow into a generic task list.
          </p>
          <div className="grid gap-3">
            <Feature icon={NotebookPen} title="Project tracking" copy="Keep received dates, due dates, writing stages, and notes together." />
            <Feature icon={Music4} title="Archive recall" copy="Search finished songs by year, artist, client, and type when you need them later." />
          </div>
        </section>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Log in</h2>
            <p className="text-sm text-ink-soft">Use your Supabase Auth account to access your private writing archive.</p>
          </CardHeader>
          <CardContent>
            <form action={signIn} className="space-y-4">
              {loginError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-danger">{loginError}</div>
              ) : null}
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Email</span>
                <Input type="email" name="email" placeholder="writer@draftroom.app" required />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Password</span>
                <Input type="password" name="password" placeholder="••••••••" required />
              </label>
              <Button type="submit" className="w-full">
                Open Draft Room
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  copy
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
      <Icon className="h-5 w-5 text-brand-600" />
      <p className="mt-3 font-medium text-ink">{title}</p>
      <p className="mt-1.5 text-sm leading-6 text-ink-soft">{copy}</p>
    </div>
  );
}
