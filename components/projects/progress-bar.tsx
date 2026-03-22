import { cn } from "@/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="h-2 rounded-full bg-white/50">
        <div
          className="h-2 rounded-full bg-ink transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <p className="text-xs font-medium text-ink/70">{value}% complete</p>
    </div>
  );
}
