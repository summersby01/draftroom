import { z } from "zod";

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
    received_at: z.string().min(1, "Received date is required"),
    due_at: z.string().min(1, "Due date is required"),
    submission_done: z.boolean().default(false),
    overall_status: z.enum(["planned", "in_progress", "submitted", "on_hold", "overdue"]).default("planned"),
    syllable_status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
    chorus_status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
    verse_status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
    notes: optionalTrimmed
  })
  .refine((value) => value.due_at >= value.received_at, {
    message: "Due date must be on or after received date",
    path: ["due_at"]
  });

export type ProjectFormValues = z.infer<typeof projectSchema>;
