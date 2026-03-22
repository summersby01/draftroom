"use client";

import { cn } from "@/lib/utils";
import type { StageStatus } from "@/types/project";

const OPTIONS: StageStatus[] = ["not_started", "in_progress", "completed"];

export function StageStatusSegmented({
  value,
  onChange
}: {
  value: StageStatus;
  onChange: (value: StageStatus) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-paper-soft p-1">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-lg px-3 py-2 text-sm capitalize transition",
            value === option ? "bg-surface text-ink shadow-soft" : "text-ink-soft hover:bg-brand-50 hover:text-brand-700"
          )}
        >
          {option.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}
