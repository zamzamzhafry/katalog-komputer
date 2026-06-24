import { CatalogApp } from "@/components/catalog-app";
import { fetchCatalogServer } from "@/lib/supabase/catalog";

export default async function HomePage() {
  const { items, error } = await fetchCatalogServer();
  return <CatalogApp initialItems={items ?? []} initialError={error} />;
}
