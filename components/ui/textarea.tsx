import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-[140px] min-w-0 w-full max-w-full rounded-[24px] border border-line bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink-muted focus-visible:border-action focus-visible:ring-0",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
