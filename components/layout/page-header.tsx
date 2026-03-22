import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  ctaLabel,
  ctaHref
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: Route;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div>
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>
      </div>
      {ctaLabel && ctaHref ? (
        <Button asChild className="w-full">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
