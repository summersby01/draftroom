import { cn } from "@/lib/utils";

const PROGRESS_STYLES = {
  light: {
    track: "#D9D9D9",
    fill: "#4A6FA5",
    text: "#111111"
  },
  dark: {
    track: "#D9D9D9",
    fill: "#0F4C81",
    text: "#111111"
  }
} as const;

export function ProgressBar({
  value,
  className,
  tone = "light"
}: {
  value: number | null | undefined;
  className?: string;
  tone?: "light" | "dark";
}) {
  const normalizedValue = Number.isFinite(value) ? Math.min(100, Math.max(0, Number(value))) : 0;
  const colors = PROGRESS_STYLES[tone];

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[12px] font-bold" style={{ color: colors.text }}>
        {normalizedValue}% complete
      </p>
      <div className="h-3 rounded-full" style={{ backgroundColor: colors.track }}>
        <div
          className="h-3 rounded-full transition-all"
          style={{ backgroundColor: colors.fill, width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
