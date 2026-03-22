import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      muted: "bg-black/10 text-ink",
      plum: "bg-note-purple text-ink",
      navy: "bg-note-blue text-ink",
      green: "bg-note-green text-ink",
      red: "bg-rose-200 text-ink",
      amber: "bg-note-yellow text-ink"
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
