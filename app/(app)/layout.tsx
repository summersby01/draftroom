import type { ReactNode } from "react";
import { headers } from "next/headers";

import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/require-user";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireUser();

  const pathname = (await headers()).get("x-pathname") ?? "/dashboard";

  return <AppShell pathname={pathname}>{children}</AppShell>;
}
