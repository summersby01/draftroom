import type { OverallStatus, ProjectType, StageStatus } from "@/types/project";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/archive", label: "Archive" },
  { href: "/settings", label: "Profile" }
] as const;

export const STAGE_STATUS_OPTIONS: { value: StageStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" }
];

export const OVERALL_STATUS_OPTIONS: { value: OverallStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "on_hold", label: "On hold" },
  { value: "submitted", label: "Submitted" },
  { value: "overdue", label: "Overdue" }
];

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "lyrics", label: "Lyrics" },
  { value: "adaptation", label: "Adaptation" },
  { value: "ost", label: "OST" },
  { value: "idol", label: "Idol" },
  { value: "topline", label: "Topline" },
  { value: "other", label: "Other" }
];
