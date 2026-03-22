"use client";

import { Check, Circle, Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StageStatus } from "@/types/project";

const OPTIONS: StageStatus[] = ["not_started", "in_progress", "completed"];

const STAGE_STYLES = {
  not_started: {
    label: "Not Started",
    icon: Circle,
    active: "bg-gray-400 text-ink scale-[1.03] shadow-sm",
    inactive: "bg-white text-ink-soft hover:bg-gray-100"
  },
  in_progress: {
    label: "In Progress",
    icon: Clock3,
    active: "bg-blue-muted text-white scale-[1.03] shadow-sm",
    inactive: "bg-white text-ink-soft hover:bg-gray-100"
  },
  completed: {
    label: "Completed",
    icon: Check,
    active: "bg-deep-blue text-white scale-[1.03] shadow-sm",
    inactive: "bg-white text-ink-soft hover:bg-gray-100"
  }
} as const;

export function StageStatusSegmented({
  value,
  onChange
}: {
  value: StageStatus;
  onChange: (value: StageStatus) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/55 p-1.5">
      {OPTIONS.map((option) => {
        const style = STAGE_STYLES[option];
        const Icon = style.icon;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition duration-150 active:scale-[0.98]",
              value === option ? style.active : style.inactive
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{style.label}</span>
          </button>
        );
      })}
    </div>
  );
}
