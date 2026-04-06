"use client";

import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";

import { signOut } from "@/app/actions/auth";
import {
  AlertDialog,
  AlertDialogActionButton,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export function LogoutConfirmButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={isPending ? undefined : setOpen}>
      <AlertDialogTrigger asChild>
        <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-action px-4 py-3 text-sm font-semibold text-white transition duration-150 hover:bg-brand-600 hover:scale-[1.01] active:scale-[0.98]">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-[28px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to sign in again to access your projects.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row">
          <AlertDialogCancelButton disabled={isPending}>Cancel</AlertDialogCancelButton>
          <AlertDialogActionButton
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await signOut();
              })
            }
          >
            {isPending ? "Logging out..." : "Log out"}
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

