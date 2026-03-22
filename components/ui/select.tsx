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
        "flex h-12 w-full rounded-2xl border border-line bg-white px-4 py-2 text-base font-medium text-ink outline-none transition focus-visible:border-action focus-visible:ring-0",
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
