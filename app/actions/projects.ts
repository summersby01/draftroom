"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { projectSchema, type ProjectFormValues } from "@/lib/validators/project";
import type { Database } from "@/types/database";
import type { Project, ProjectHistoryActionType } from "@/types/project";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
type ProjectHistoryInsert = Database["public"]["Tables"]["project_history"]["Insert"];

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
  const payload: ProjectInsert = {
    ...parsed,
    user_id: userId
  };

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
  const payload: ProjectUpdate = parsed;

  const { error } = await supabase.from("projects" as never).update(payload as never).eq("id", id);
  if (error) throw new Error(error.message);

  const historyEntries = buildProjectHistoryEntries(existing, parsed, userId);
  await insertHistoryEntries(supabase, historyEntries);

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/archive");
}

export async function toggleSubmission(id: string, submissionDone: boolean) {
  const { supabase, userId } = await getUserId();
  const existing = await getExistingProject(supabase, id);
  const payload: ProjectUpdate = { submission_done: submissionDone };
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
  if (error) throw new Error(error.message);
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

  const generalFields: (keyof Pick<ProjectFormValues, "title" | "artist" | "client" | "project_type" | "received_at">)[] = [
    "title",
    "artist",
    "client",
    "project_type",
    "received_at"
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
