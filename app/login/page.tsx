import type { ComponentType } from "react";
import { Music4, NotebookPen } from "lucide-react";

import { sendMagicLink, signInWithGoogle } from "@/app/actions/auth";
import { AuthSubmitButton } from "@/components/forms/auth-submit-button";
import { DraftRoomLogo } from "@/components/layout/draft-room-logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorMessage = typeof params.error === "string" ? params.error : null;
  const statusMessage = typeof params.status === "string" ? params.status : null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-white px-4 py-6">
      <div className="space-y-4">
        <section className="rounded-[28px] bg-note-purple p-5">
          <DraftRoomLogo withWordmark />
          <h1 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-ink">
            A clean note-based workspace for songwriting projects.
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Track due dates, writing stages, and finished songs with the speed of a native notes app.
          </p>
        </section>

        <div className="grid gap-3">
          <Feature color="bg-note-yellow" icon={NotebookPen} title="Capture project work" copy="Keep title, D-day, stages, and notes in one fast workflow." />
          <Feature color="bg-note-blue" icon={Music4} title="Browse your archive" copy="Jump back into completed songs and past commissions without clutter." />
        </div>

        <Card className="rounded-[28px] bg-note-green">
          <CardHeader className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-ink">Sign in to Draft Room</h2>
            <p className="text-sm leading-6 text-ink/70">
              Use your email or Google account to continue. If you don&apos;t have an account yet, one will be created automatically.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage ? (
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-danger">{errorMessage}</div>
            ) : null}
            {statusMessage ? (
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-ink">{statusMessage}</div>
            ) : null}

            <form action={sendMagicLink} className="space-y-3">
              <label className="block space-y-2 text-sm">
                <span className="font-semibold text-ink">Email</span>
                <Input type="email" name="email" placeholder="writer@draftroom.app" required className="border-0" />
              </label>
              <p className="text-sm text-ink/70">We&apos;ll send you a secure sign-in link.</p>
              <AuthSubmitButton label="Continue with Email" pendingLabel="Sending sign-in link..." />
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">or</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <form action={signInWithGoogle}>
              <AuthSubmitButton label="Continue with Google" pendingLabel="Connecting to Google..." variant="outline" />
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
  copy,
  color
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  copy: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-[24px] p-4`}>
      <Icon className="h-5 w-5 text-ink" />
      <p className="mt-3 text-base font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-ink/70">{copy}</p>
    </div>
  );
}
