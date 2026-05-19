import { createClient } from "@/lib/supabase/client";
import type { CatalogItem } from "@/lib/types";

const SUPABASE_STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catalog-images/`
  : "";

/**
 * Build a public image URL from the bucket path.
 * Falls back to foto_url or placeholder.
 */
export function getImageUrl(item: {
  image_path?: string | null;
  foto_url?: string | null;
}): string {
  if (item.image_path && SUPABASE_STORAGE_URL) {
    return `${SUPABASE_STORAGE_URL}${item.image_path}`;
  }
  if (item.foto_url) {
    return item.foto_url;
  }
  return "https://placehold.co/1200x800?text=No+Photo";
}

/**
 * Fetch all catalog items from Supabase.
 * Returns null if Supabase is not configured (graceful fallback).
 */
export async function fetchCatalog(): Promise<CatalogItem[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
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

  return data.map((row) => ({
    ProductID: row.product_id,
    Kategori: row.kategori,
    Brand: row.brand,
    Model: row.model,
    Processor: row.processor,
    RAM: row.ram,
    Storage: row.storage,
    Harga: row.harga,
    Stok: row.stok,
    FotoURL: getImageUrl(row),
    Deskripsi: row.deskripsi,
  }));
}
