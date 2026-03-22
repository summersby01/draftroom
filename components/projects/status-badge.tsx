import { Badge } from "@/components/ui/badge";
import type { OverallStatus, ProjectRisk, StageStatus } from "@/types/project";

export function ProjectStatusBadge({ status }: { status: OverallStatus }) {
  const map = {
    planned: { label: "Planned", variant: "muted" as const },
    in_progress: { label: "In progress", variant: "plum" as const },
    submitted: { label: "Submitted", variant: "green" as const },
    on_hold: { label: "On hold", variant: "amber" as const },
    overdue: { label: "Overdue", variant: "red" as const }
  };

  const current = map[status];
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function StageStatusBadge({ status }: { status: StageStatus }) {
  const map = {
    not_started: { label: "Not started", variant: "muted" as const },
    in_progress: { label: "In progress", variant: "plum" as const },
    completed: { label: "Completed", variant: "green" as const }
  };

  const current = map[status];
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function RiskBadge({ risk }: { risk: ProjectRisk }) {
  const variantMap = {
    red: "red",
    amber: "amber",
    plum: "plum",
    navy: "navy"
  } as const;

  return <Badge variant={variantMap[risk.tone]}>{risk.label}</Badge>;
}
