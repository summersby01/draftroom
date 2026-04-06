"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createProject, toggleSubmission, updateProject } from "@/app/actions/projects";
import { getDeadlineLabel } from "@/lib/project-insights";
import { StageStatusSegmented } from "@/components/projects/stage-status-segmented";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import {
  DRAFT_ROOM_PREFERENCES_KEY,
  mergeDraftRoomPreferences
} from "@/lib/profile-preferences";
import { getProjectProgressState } from "@/lib/project-status";
import { projectSchema, type ProjectFormValues } from "@/lib/validators/project";
import type { Project } from "@/types/project";

const DEFAULT_VALUES: ProjectFormValues = {
  title: "",
  artist: "",
  client: "",
  project_type: "lyrics",
  received_at: undefined,
  due_at: new Date().toISOString().slice(0, 10),
  due_time: undefined,
  submission_done: false,
  submission_status: "pending",
  is_portfolio: false,
  accepted_at: null,
  portfolio_note: "",
  overall_status: "planned",
  syllable_status: "not_started",
  chorus_status: "not_started",
  verse_status: "not_started",
  notes: ""
};

export function ProjectForm({ project, detailMode = false }: { project?: Project | null; detailMode?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          artist: project.artist ?? "",
          client: project.client ?? "",
          project_type: project.project_type,
          received_at: project.received_at,
          due_at: project.due_at,
          due_time: project.due_time ?? undefined,
          submission_done: project.submission_done,
          submission_status: project.submission_status,
          is_portfolio: project.is_portfolio,
          accepted_at: project.accepted_at,
          portfolio_note: project.portfolio_note ?? "",
          overall_status: project.overall_status,
          syllable_status: project.syllable_status,
          chorus_status: project.chorus_status,
          verse_status: project.verse_status,
          notes: project.notes ?? ""
        }
      : DEFAULT_VALUES
  });

  const values = form.watch();
  const progressState = getProjectProgressState(values);
  const progress = progressState.progressPercent;
  const canSubmit = progressState.canSubmit;

  useEffect(() => {
    if (project) return;

    try {
      const stored = window.localStorage.getItem(DRAFT_ROOM_PREFERENCES_KEY);
      if (!stored) return;
      const preferences = mergeDraftRoomPreferences(JSON.parse(stored) as Record<string, string>);

      const currentDueTime = form.getValues("due_time");
      const currentProjectType = form.getValues("project_type");

      if (!currentDueTime && preferences.defaultDueTime) {
        form.setValue("due_time", preferences.defaultDueTime, { shouldDirty: false });
      }

      if ((currentProjectType === "lyrics" || !currentProjectType) && preferences.defaultProjectType) {
        form.setValue("project_type", preferences.defaultProjectType as ProjectFormValues["project_type"], {
          shouldDirty: false
        });
      }
    } catch {
      // Ignore missing or malformed local preference state.
    }
  }, [form, project]);

  const onSubmit = (payload: ProjectFormValues) => {
    startTransition(async () => {
      try {
        if (project) {
          await updateProject(project.id, payload);
          toast.success("Project updated");
          router.refresh();
        } else {
          const result = await createProject(payload);
          router.push(`/projects/${result.id}`);
          router.refresh();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save project");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={detailMode ? "min-w-0 space-y-4 overflow-x-hidden pb-28" : "min-w-0 space-y-4 overflow-x-hidden pb-6"}>
      <input type="hidden" {...form.register("overall_status")} />
      {project ? <input type="hidden" {...form.register("received_at")} /> : null}
      <Card className="rounded-[28px] bg-note-blue">
        <CardHeader>
          <h2 className="text-xl font-bold tracking-tight text-ink">Project details</h2>
          <p className="text-sm text-ink/70">Track writing timeline, commission info, and lyric notes in one place.</p>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-4 overflow-hidden">
          <Field label="Title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} placeholder="Midnight letter" />
          </Field>
          <Field label="Project type">
            <Select options={PROJECT_TYPE_OPTIONS} {...form.register("project_type")} />
          </Field>
          <Field label="Artist / project name">
            <Input {...form.register("artist")} placeholder="Ari Lane" />
          </Field>
          <Field label="Client">
            <Input {...form.register("client")} placeholder="Blue House Publishing" />
          </Field>
          <div className="grid w-full min-w-0 grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2">
            <Field label="Due date" error={form.formState.errors.due_at?.message}>
              <Input type="date" {...form.register("due_at")} />
            </Field>
            <Field label="Due time" error={form.formState.errors.due_time?.message}>
              <Input type="time" {...form.register("due_time")} />
            </Field>
          </div>
          <div className="rounded-2xl bg-white/55 px-4 py-3 text-sm font-medium text-ink/70">
            {project ? `Received on ${project.received_at}` : "Received date is set automatically when you create the project."}
          </div>
          <Field label="Submission">
            <label className="flex h-12 items-center gap-3 rounded-2xl bg-white px-4 text-sm font-medium text-ink">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" {...form.register("submission_done")} />
              Mark submission complete
            </label>
          </Field>
          {project || detailMode ? (
            <>
              <Field label="Submission result">
                <Select
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "accepted", label: "Accepted" },
                    { value: "rejected", label: "Not selected" }
                  ]}
                  {...form.register("submission_status")}
                  disabled={!values.submission_done}
                />
                {!values.submission_done ? (
                  <p className="text-xs text-ink-soft">Available after the project has been submitted.</p>
                ) : null}
              </Field>

              <Field label="Portfolio">
                <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 text-sm font-medium text-ink">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand-600"
                    {...form.register("is_portfolio")}
                    disabled={!values.submission_done || values.submission_status !== "accepted"}
                  />
                  Add to portfolio
                </label>
                {values.submission_status !== "accepted" ? (
                  <p className="text-xs text-ink-soft">Only accepted projects can be added to Portfolio.</p>
                ) : null}
              </Field>

              {values.submission_done && values.submission_status === "accepted" && values.is_portfolio ? (
                <Field label="Portfolio note">
                  <Textarea
                    {...form.register("portfolio_note")}
                    placeholder="Why this piece belongs in your portfolio, standout details, or reference notes..."
                  />
                </Field>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] bg-note-yellow">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink">Writing stages</h2>
              <p className="text-sm text-ink/70">Progress auto-calculates from the three songwriting stages.</p>
            </div>
            <div className="rounded-full bg-white/50 px-4 py-2 text-sm font-semibold text-ink">{progress}%</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <StageField label="Syllable planning" value={values.syllable_status} onChange={(value) => form.setValue("syllable_status", value)} />
          <StageField label="Chorus writing" value={values.chorus_status} onChange={(value) => form.setValue("chorus_status", value)} />
          <StageField label="Remaining lyrics" value={values.verse_status} onChange={(value) => form.setValue("verse_status", value)} />
        </CardContent>
      </Card>

      <Card className="rounded-[28px] bg-note-coral">
        <CardHeader>
          <h2 className="text-xl font-bold tracking-tight text-ink">Notes</h2>
        </CardHeader>
        <CardContent>
          <Textarea {...form.register("notes")} placeholder="Reference phrases, concept notes, rhyme ideas, client feedback..." />
        </CardContent>
      </Card>

      {detailMode ? (
        <div className="fixed inset-x-0 bottom-[72px] z-20 mx-auto w-full max-w-md bg-white px-4 pb-4 pt-3">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink/60">
            <span>{getDeadlineLabel(values)}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Button type="submit" disabled={isPending} className="min-h-12">
              Save changes
            </Button>
            {project ? (
              <Button
                type="button"
                variant={values.submission_done ? "outline" : "secondary"}
                className="min-h-12 px-4"
                disabled={isPending || (!values.submission_done && !canSubmit)}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await toggleSubmission(project.id, !values.submission_done);
                      toast.success(values.submission_done ? "Submission reopened" : "Marked submitted");
                      router.refresh();
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Could not update submission");
                    }
                  })
                }
              >
                {values.submission_done ? "Reopen" : "Submit"}
              </Button>
            ) : null}
          </div>
          {!values.submission_done && !canSubmit ? (
            <p className="mt-2 text-center text-[11px] font-semibold text-ink-soft">Complete all stages to enable Submit.</p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isPending} className="w-full min-h-12">
            {project ? "Save changes" : "Create project"}
          </Button>
          <Button variant="outline" asChild className="w-full min-h-12">
            <Link href={project ? `/projects/${project.id}` : "/projects"}>Cancel</Link>
          </Button>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="min-w-0 max-w-full space-y-2 text-sm">
      <span className="font-semibold text-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}

function StageField({
  label,
  value,
  onChange
}: {
  label: string;
  value: ProjectFormValues["syllable_status"];
  onChange: (value: ProjectFormValues["syllable_status"]) => void;
}) {
  return (
    <div className="space-y-3 rounded-[22px] bg-white/45 p-4">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <StageStatusSegmented value={value} onChange={onChange} />
    </div>
  );
}
