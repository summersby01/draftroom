"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { deriveProjectStatus } from "@/lib/project-status";
import { projectSchema, type ProjectFormValues } from "@/lib/validators/project";
import type { Database } from "@/types/database";
import type { OverallStatus, Project, ProjectHistoryActionType, StageStatus } from "@/types/project";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
type ProjectHistoryInsert = Database["public"]["Tables"]["project_history"]["Insert"];
type InlineProjectUpdate = {
  syllable_status?: StageStatus;
  chorus_status?: StageStatus;
  verse_status?: StageStatus;
  submission_done?: boolean;
  overall_status?: OverallStatus;
};

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  return { supabase, userId: user.id };
}

export async function createProject(values: ProjectFormValues) {
  const parsed = projectSchema.parse(values);
  const { supabase, userId } = await getUserId();
  const payload = normalizeProjectInsertPayload(parsed, userId);

  const { data, error } = await supabase
    .from("projects" as never)
    .insert(payload as never)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await insertHistoryEntries(supabase, [
    {
      project_id: (data as { id: string }).id,
      user_id: userId,
      action_type: "project_created",
      new_value: parsed.title
    }
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/archive");

  return { id: (data as { id: string }).id };
}

export async function updateProject(id: string, values: ProjectFormValues) {
  const parsed = projectSchema.parse(values);
  const { supabase, userId } = await getUserId();
  const existing = await getExistingProject(supabase, id);
  const nextOverallStatus = parsed.submission_done
    ? "submitted"
    : deriveProjectStatus({
        submission_done: false,
        due_at: parsed.due_at,
        overall_status: parsed.overall_status,
        syllable_status: parsed.syllable_status,
        chorus_status: parsed.chorus_status,
        verse_status: parsed.verse_status
      });
  const payload: ProjectUpdate = {
    ...parsed,
    received_at: parsed.received_at ?? existing.received_at,
    submitted_at: parsed.submission_done ? existing.submitted_at ?? getCurrentUtcTimestamp() : null,
    overall_status: nextOverallStatus
  };

  const { error } = await supabase.from("projects" as never).update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);

  const historyEntries = buildProjectHistoryEntries(existing, parsed, userId);
  await insertHistoryEntries(supabase, historyEntries);

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/archive");
}

export async function updateProjectInline(id: string, patch: InlineProjectUpdate) {
  const { supabase, userId } = await getUserId();
  const existing = await getExistingProject(supabase, id);
  const payload: ProjectUpdate = sanitizeInlinePatch(patch);
  const nextProject = {
    ...existing,
    ...payload
  };

  if (typeof patch.submission_done === "boolean") {
    payload.submitted_at = patch.submission_done ? existing.submitted_at ?? getCurrentUtcTimestamp() : null;
    payload.overall_status = patch.submission_done
      ? "submitted"
      : deriveProjectStatus({
          submission_done: false,
          due_at: nextProject.due_at,
          overall_status: nextProject.overall_status,
          syllable_status: nextProject.syllable_status,
          chorus_status: nextProject.chorus_status,
          verse_status: nextProject.verse_status
        });
  } else if (
    patch.syllable_status ||
    patch.chorus_status ||
    patch.verse_status ||
    patch.overall_status
  ) {
    payload.overall_status = deriveProjectStatus({
      submission_done: nextProject.submission_done,
      due_at: nextProject.due_at,
      overall_status: nextProject.overall_status,
      syllable_status: nextProject.syllable_status,
      chorus_status: nextProject.chorus_status,
      verse_status: nextProject.verse_status
    });
  }

  if (!Object.keys(payload).length) {
    return existing;
  }

  const { data, error } = await supabase
    .from("projects" as never)
    .update(payload as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const updated = data as Project;
  const historyEntries = buildProjectHistoryEntries(existing, projectToFormValues(updated), userId);
  await insertHistoryEntries(supabase, historyEntries);

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/archive");

  return updated;
}

export async function toggleSubmission(id: string, submissionDone: boolean) {
  const { supabase, userId } = await getUserId();
  const existing = await getExistingProject(supabase, id);
  const payload: ProjectUpdate = {
    submission_done: submissionDone,
    submitted_at: submissionDone ? existing.submitted_at ?? getCurrentUtcTimestamp() : null,
    overall_status: submissionDone
      ? "submitted"
      : deriveProjectStatus({
          submission_done: false,
          due_at: existing.due_at,
          overall_status: existing.overall_status === "submitted" ? "planned" : existing.overall_status,
          syllable_status: existing.syllable_status,
          chorus_status: existing.chorus_status,
          verse_status: existing.verse_status
        })
  };
  const { error } = await supabase.from("projects" as never).update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);

  if (existing.submission_done !== submissionDone) {
    await insertHistoryEntries(supabase, [
      {
        project_id: existing.id,
        user_id: userId,
        action_type: submissionDone ? "submission_marked" : "submission_unmarked",
        field_name: "submission_done",
        old_value: String(existing.submission_done),
        new_value: String(submissionDone)
      }
    ]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/archive");
}

export async function deleteProject(id: string) {
  const { supabase } = await getUserId();
  const { error } = await supabase.from("projects" as never).delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/archive");
}

async function getExistingProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string
) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error || !data) throw new Error("Project not found");
  return data as Project;
}

async function insertHistoryEntries(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entries: ProjectHistoryInsert[]
) {
  if (!entries.length) return;

  const { error } = await supabase.from("project_history" as never).insert(entries as never);
  if (error) {
    if (isMissingProjectHistoryTableError(error)) return;
    throw new Error(error.message);
  }
}

function buildProjectHistoryEntries(existing: Project, next: ProjectFormValues, userId: string): ProjectHistoryInsert[] {
  const entries: ProjectHistoryInsert[] = [];

  const push = (
    actionType: ProjectHistoryActionType,
    fieldName: string | null,
    oldValue: string | null,
    newValue: string | null
  ) => {
    entries.push({
      project_id: existing.id,
      user_id: userId,
      action_type: actionType,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue
    });
  };

  const generalFields: (keyof Pick<ProjectFormValues, "title" | "artist" | "client" | "project_type">)[] = [
    "title",
    "artist",
    "client",
    "project_type"
  ];

  generalFields.forEach((field) => {
    const oldValue = normalizeValue(existing[field as keyof Project] as string | null | boolean);
    const newValue = normalizeValue(next[field] as string | null | boolean);
    if (oldValue !== newValue) {
      push("project_updated", field, oldValue, newValue);
    }
  });

  (["syllable_status", "chorus_status", "verse_status"] as const).forEach((field) => {
    if (existing[field] !== next[field]) {
      push("stage_updated", field, existing[field], next[field]);
    }
  });

  if (existing.due_at !== next.due_at) {
    push("due_date_changed", "due_at", existing.due_at, next.due_at);
  }

  if (normalizeValue(existing.notes) !== normalizeValue(next.notes)) {
    push("note_updated", "notes", normalizeValue(existing.notes), normalizeValue(next.notes));
  }

  if (existing.submission_done !== next.submission_done) {
    push(
      next.submission_done ? "submission_marked" : "submission_unmarked",
      "submission_done",
      String(existing.submission_done),
      String(next.submission_done)
    );
  }

  return entries;
}

function normalizeValue(value: string | null | boolean | undefined) {
  if (typeof value === "boolean") return String(value);
  if (value === undefined || value === null || value === "") return null;
  return value;
}

function sanitizeInlinePatch(patch: InlineProjectUpdate): InlineProjectUpdate {
  const next: InlineProjectUpdate = {};

  if (patch.syllable_status) next.syllable_status = patch.syllable_status;
  if (patch.chorus_status) next.chorus_status = patch.chorus_status;
  if (patch.verse_status) next.verse_status = patch.verse_status;
  if (typeof patch.submission_done === "boolean") next.submission_done = patch.submission_done;
  if (patch.overall_status) next.overall_status = patch.overall_status;

  return next;
}

function projectToFormValues(project: Project): ProjectFormValues {
  return {
    title: project.title,
    artist: project.artist,
    client: project.client,
    project_type: project.project_type,
    received_at: project.received_at,
    due_at: project.due_at,
    submission_done: project.submission_done,
    overall_status: project.overall_status,
    syllable_status: project.syllable_status,
    chorus_status: project.chorus_status,
    verse_status: project.verse_status,
    notes: project.notes
  };
}

function normalizeProjectInsertPayload(values: ProjectFormValues, userId: string): ProjectInsert {
  const submittedAt = values.submission_done ? getCurrentUtcTimestamp() : null;
  const overallStatus = values.submission_done
    ? "submitted"
    : deriveProjectStatus({
        submission_done: false,
        due_at: values.due_at,
        overall_status: values.overall_status,
        syllable_status: values.syllable_status,
        chorus_status: values.chorus_status,
        verse_status: values.verse_status
      });

  return {
    title: values.title,
    artist: normalizeNullableText(values.artist),
    client: normalizeNullableText(values.client),
    project_type: values.project_type,
    received_at: normalizeDateString(values.received_at) ?? new Date().toISOString().slice(0, 10),
    due_at: normalizeRequiredDateString(values.due_at),
    submitted_at: submittedAt,
    submission_done: values.submission_done,
    overall_status: overallStatus,
    syllable_status: values.syllable_status,
    chorus_status: values.chorus_status,
    verse_status: values.verse_status,
    notes: normalizeNullableText(values.notes),
    user_id: userId
  };
}

function getCurrentUtcTimestamp() {
  return new Date().toISOString();
}

function normalizeNullableText(value: string | null | undefined) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

function normalizeDateString(value: string | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeRequiredDateString(value: string) {
  const normalized = normalizeDateString(value);
  if (!normalized) {
    throw new Error("Due date is required");
  }
  return normalized;
}

function isMissingProjectHistoryTableError(error: { message?: string; code?: string } | null) {
  if (!error) return false;

  return (
    error.code === "PGRST205" ||
    error.message?.includes("public.project_history") === true ||
    error.message?.includes("schema cache") === true
  );
}
