import { createClient } from "@/lib/supabase/client";
import { createServerClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/image-url";
import { parseHargaToNumber } from "@/lib/format";
import type { CatalogItem } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

// Re-export pure domain fn (Q7) for callers using old path.
export { getImageUrl };

type CatalogRow = Database["public"]["Tables"]["catalog_items"]["Row"];

/** DB row -> CatalogItem. Harga: harga_number (Q5), fallback parse TEXT. */
export function mapRow(row: CatalogRow): CatalogItem {
  const harga =
    typeof row.harga_number === "number" && row.harga_number > 0
      ? row.harga_number
      : parseHargaToNumber(row.harga ?? "");
  return {
    ProductID: row.product_id,
    Kategori: row.kategori,
    Brand: row.brand,
    Model: row.model,
    Processor: row.processor ?? "",
    RAM: row.ram ?? "",
    Storage: row.storage ?? "",
    Harga: harga,
    Stok: row.stok,
    FotoURL: getImageUrl(row),
    Deskripsi: row.deskripsi,
  };
}

export type FetchResult = {
  items: CatalogItem[] | null;
  /** true = runtime error (Supabase reject/throw). false = config-missing atau sukses. Q13. */
  error: boolean;
};

/**
 * Server-side fetch (Q9). Dipanggil di Server Component / Server Action.
 * Config-missing -> {items:null, error:false}. Runtime-error -> {items:null, error:true}.
 */
export async function fetchCatalogServer(): Promise<FetchResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return { items: null, error: false };
  }
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("catalog_items")
      .select("*")
      .order("product_id", { ascending: true });
    if (error || !data) {
      console.error("Supabase fetch error:", error?.message);
      return { items: null, error: true };
    }
    return { items: data.map(mapRow), error: false };
  } catch (err) {
    console.error("Supabase fetch throw:", err);
    return { items: null, error: true };
  }
}

/**
 * Browser fetch (client refetch setelah mutasi). Pakai mapRow juga.
 * Returns null if Supabase not configured or error (caller fallback ke cache).
 */
export async function fetchCatalog(): Promise<CatalogItem[] | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("catalog_items")
    .select("*")
    .order("product_id", { ascending: true });
  if (error || !data) {
    console.error("Supabase fetch error:", error?.message);
    return null;
  }
  return data.map(mapRow);
}
