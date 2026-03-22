import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

export function Select({ className, options, ...props }: NativeSelectProps) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink outline-none transition focus-visible:border-brand-200 focus-visible:ring-4 focus-visible:ring-brand-50",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
