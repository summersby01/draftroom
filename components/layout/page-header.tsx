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
    <div className="space-y-3">
      <div>
        <h1 className="text-[2rem] font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-sm leading-6 text-ink-soft">{description}</p>
      </div>
      {ctaLabel && ctaHref ? (
        <Button asChild className="w-full">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
