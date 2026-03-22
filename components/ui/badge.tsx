import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      muted: "bg-gray-200 text-ink",
      plum: "bg-deep-blue text-white",
      navy: "bg-blue-muted text-white",
      green: "bg-deep-blue text-white",
      red: "bg-action text-white",
      amber: "bg-gray-400 text-ink"
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
