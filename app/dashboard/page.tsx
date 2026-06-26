import { redirect } from "next/navigation";
import { fetchCatalogServer } from "@/lib/supabase/catalog";
import { getUserServer } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard-view";

export const metadata = { title: "Dashboard — Katalog Komputer" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getUserServer();
  if (!user) redirect("/login?redirect=/dashboard");

  const { items, error } = await fetchCatalogServer();
  return (
    <DashboardView
      items={items ?? []}
      userEmail={user.email ?? ""}
      fetchError={error}
    />
  );
}
