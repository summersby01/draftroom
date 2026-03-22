import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SummaryCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Card className="min-w-[150px] shrink-0">
      <CardHeader className="px-4 pb-2 pt-4">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
        <p className="mt-2 text-xs leading-5 text-ink-soft">{hint}</p>
      </CardContent>
    </Card>
  );
}
