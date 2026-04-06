import { z } from "zod";

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDateInput(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeTimeInput(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

export const projectSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    artist: optionalTrimmed,
    client: optionalTrimmed,
    project_type: z.enum(["lyrics", "adaptation", "ost", "idol", "topline", "other"]),
    received_at: z.preprocess(normalizeDateInput, z.string().optional()),
    due_at: z.preprocess(normalizeDateInput, z.string({ required_error: "Due date is required" }).min(1, "Due date is required")),
    due_time: z.preprocess(normalizeTimeInput, z.string().regex(/^\d{2}:\d{2}$/, "Invalid time").nullable().optional()),
    submission_done: z.boolean().default(false),
    is_accepted: z.boolean().default(false),
    is_portfolio: z.boolean().default(false),
    accepted_at: optionalTrimmed,
    portfolio_note: optionalTrimmed,
    overall_status: z.enum(["planned", "in_progress", "submitted", "on_hold", "overdue"]).default("planned"),
    syllable_status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
    chorus_status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
    verse_status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
    notes: optionalTrimmed
  })
  .superRefine((value, ctx) => {
    const receivedAt = value.received_at ?? getTodayDateString();
    if (!value.due_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date is required",
        path: ["due_at"]
      });
      return;
    }

    if (value.due_at < receivedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date must be on or after received date",
        path: ["due_at"]
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectSchema>;
