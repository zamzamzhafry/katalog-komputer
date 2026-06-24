import { CatalogApp } from "@/components/catalog-app";
import { fetchCatalogServer } from "@/lib/supabase/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { items, error } = await fetchCatalogServer();
  return <CatalogApp initialItems={items ?? []} initialError={error} />;
}
