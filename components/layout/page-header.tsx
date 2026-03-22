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
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-[2.15rem] font-black tracking-[-0.04em] text-ink">{title}</h1>
        <p className="max-w-[30rem] text-sm leading-6 text-ink-soft">{description}</p>
      </div>
      {ctaLabel && ctaHref ? (
        <Button asChild className="min-h-12 w-full text-base font-bold">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
