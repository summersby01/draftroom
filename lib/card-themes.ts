export type CardThemeName = "yellow" | "blue" | "purple" | "red" | "green";

export const CARD_THEMES = {
  yellow: {
    card: "bg-white border-l-[6px] border-l-action",
    textPrimary: "text-ink",
    textSecondary: "text-ink-soft",
    eyebrow: "text-ink-soft",
    statusPill: "bg-gray-200 text-ink",
    surface: "border border-line bg-surface-soft",
    surfaceSoft: "bg-surface-soft",
    progressTone: "light" as const,
    button: "bg-action text-white hover:bg-brand-600",
    stageIdle: "border border-line bg-white text-ink-soft",
    stageActive: "border border-transparent bg-blue-muted text-white",
    stageDone: "border border-transparent bg-deep-blue text-white"
  },
  blue: {
    card: "bg-white border-l-[6px] border-l-blue-muted",
    textPrimary: "text-ink",
    textSecondary: "text-ink-soft",
    eyebrow: "text-blue-muted",
    statusPill: "bg-blue-muted text-white",
    surface: "border border-line bg-[rgba(74,111,165,0.08)]",
    surfaceSoft: "bg-[rgba(74,111,165,0.08)]",
    progressTone: "light" as const,
    button: "bg-blue-muted text-white hover:opacity-95",
    stageIdle: "border border-line bg-white text-ink-soft",
    stageActive: "border border-transparent bg-blue-muted text-white",
    stageDone: "border border-transparent bg-deep-blue text-white"
  },
  purple: {
    card: "bg-white border-l-[6px] border-l-deep-blue",
    textPrimary: "text-ink",
    textSecondary: "text-ink-soft",
    eyebrow: "text-deep-blue",
    statusPill: "bg-deep-blue text-white",
    surface: "border border-line bg-[rgba(15,76,129,0.08)]",
    surfaceSoft: "bg-[rgba(15,76,129,0.08)]",
    progressTone: "light" as const,
    button: "bg-action text-white hover:bg-brand-600",
    stageIdle: "border border-line bg-white text-ink-soft",
    stageActive: "border border-transparent bg-blue-muted text-white",
    stageDone: "border border-transparent bg-deep-blue text-white"
  },
  red: {
    card: "bg-white border-l-[6px] border-l-action",
    textPrimary: "text-ink",
    textSecondary: "text-ink-soft",
    eyebrow: "text-action",
    statusPill: "bg-action text-white",
    surface: "border border-line bg-[rgba(255,106,0,0.08)]",
    surfaceSoft: "bg-[rgba(255,106,0,0.08)]",
    progressTone: "light" as const,
    button: "bg-action text-white hover:bg-brand-600",
    stageIdle: "border border-line bg-white text-ink-soft",
    stageActive: "border border-transparent bg-blue-muted text-white",
    stageDone: "border border-transparent bg-deep-blue text-white"
  },
  green: {
    card: "bg-white border-l-[6px] border-l-deep-blue",
    textPrimary: "text-ink",
    textSecondary: "text-ink-soft",
    eyebrow: "text-deep-blue",
    statusPill: "bg-deep-blue text-white",
    surface: "border border-line bg-surface-soft",
    surfaceSoft: "bg-surface-soft",
    progressTone: "light" as const,
    button: "bg-blue-muted text-white hover:opacity-95",
    stageIdle: "border border-line bg-white text-ink-soft",
    stageActive: "border border-transparent bg-blue-muted text-white",
    stageDone: "border border-transparent bg-deep-blue text-white"
  }
} as const;

export function getProjectCardThemeName(input: {
  overall_status: string;
  submission_done: boolean;
  hasDeadlineRisk?: boolean;
  hasUrgentRisk?: boolean;
}): CardThemeName {
  if (input.submission_done || input.overall_status === "submitted") return "green";
  if (input.overall_status === "overdue" || input.hasUrgentRisk) return "red";
  if (input.hasDeadlineRisk) return "yellow";
  if (input.overall_status === "in_progress") return "blue";
  return "purple";
}
