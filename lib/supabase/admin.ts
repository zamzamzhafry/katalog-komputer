import { createClient } from "@/lib/supabase/client";
import type { CatalogItem } from "@/lib/types";

/**
 * Update a catalog item in Supabase (requires authenticated session).
 */
export async function updateCatalogItem(item: CatalogItem): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("catalog_items")
    .update({
      kategori: item.Kategori,
      brand: item.Brand,
      model: item.Model,
      processor: item.Processor,
      ram: item.RAM,
      storage: item.Storage,
      harga: item.Harga,
      stok: item.Stok,
      foto_url: item.FotoURL,
      deskripsi: item.Deskripsi,
      updated_at: new Date().toISOString(),
    })
    .eq("product_id", item.ProductID);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Insert a new catalog item (requires authenticated session).
 */
export async function insertCatalogItem(item: CatalogItem): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("catalog_items")
    .insert({
      product_id: item.ProductID,
      kategori: item.Kategori,
      brand: item.Brand,
      model: item.Model,
      processor: item.Processor,
      ram: item.RAM,
      storage: item.Storage,
      harga: item.Harga,
      stok: item.Stok,
      foto_url: item.FotoURL,
      deskripsi: item.Deskripsi,
    });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Delete a catalog item (requires authenticated session).
 */
export async function deleteCatalogItem(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("catalog_items")
    .delete()
    .eq("product_id", productId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
