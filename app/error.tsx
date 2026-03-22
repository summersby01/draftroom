"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Something went wrong</h2>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          The page could not be loaded. Try again, or refresh if the problem persists.
        </p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
