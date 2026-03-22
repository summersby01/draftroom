"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function AuthSubmitButton({
  label,
  pendingLabel,
  variant = "default"
}: {
  label: string;
  pendingLabel: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full min-h-12" disabled={pending} variant={variant}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
