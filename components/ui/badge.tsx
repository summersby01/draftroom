import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium", {
  variants: {
    variant: {
      muted: "border-line bg-surface-soft text-ink-soft",
      plum: "border-brand-200 bg-brand-50 text-brand-700",
      navy: "border-slate-200 bg-slate-50 text-info",
      green: "border-green-200 bg-green-50 text-success",
      red: "border-rose-200 bg-rose-50 text-danger",
      amber: "border-amber-200 bg-amber-50 text-warning"
    }
  },
  defaultVariants: {
    variant: "muted"
  }
});

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
