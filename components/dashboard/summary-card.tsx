import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SummaryCard({
  label,
  value,
  hint,
  tone = "bg-note-yellow"
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: string;
}) {
  return (
    <Card className={`min-w-[156px] shrink-0 rounded-[24px] ${tone} hover:scale-[1.01]`}>
      <CardHeader className="px-4 pb-2 pt-4">
        <p className="text-xs uppercase tracking-[0.12em] text-ink/60">{label}</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className="text-3xl font-bold tracking-tight text-ink">{value}</p>
        <p className="mt-2 text-xs leading-5 text-ink/70">{hint}</p>
      </CardContent>
    </Card>
  );
}
