import { cn } from "@/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2.5 rounded-full bg-paper-soft">
        <div
          className="h-2.5 rounded-full bg-brand-600 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <p className="text-xs font-medium text-ink-soft">{value}% complete</p>
    </div>
  );
}
