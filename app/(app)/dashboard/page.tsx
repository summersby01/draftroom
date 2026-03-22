import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/data/projects";

export default async function DashboardPage() {
  await requireUser();
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
