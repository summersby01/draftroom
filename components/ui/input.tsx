import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 min-w-0 w-full max-w-full rounded-2xl border border-line bg-white px-4 py-2 text-base text-ink outline-none transition placeholder:text-ink-muted focus-visible:border-action focus-visible:ring-0",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
