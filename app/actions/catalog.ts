"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUserServer } from "@/lib/supabase/server";
import { parseHargaToNumber } from "@/lib/format";
import type { CatalogItem } from "@/lib/types";

export type ActionResult = { success: boolean; error?: string };

// Postgres error code -> pesan Indonesia. Q11.
const ERROR_MAP: Record<string, string> = {
  "23505": "ID produk sudah ada. Pakai ID lain.",
  "23502": "Field wajib kosong.",
  "23514": "Data tidak valid (cek stok/harga).",
};

function mapError(message: string, code?: string): string {
  if (code && ERROR_MAP[code]) return ERROR_MAP[code];
  if (message.includes("row level security")) {
    return "Akses ditolak. Login sebagai admin.";
  }
  return message || "Operasi gagal.";
}

/** Authz: semua mutasi butuh session terautentikasi. Jangan andalkan RLS saja. */
async function requireUser() {
  const user = await getUserServer();
  if (!user) return { ok: false as const, error: "Akses ditolak. Login sebagai admin." };
  return { ok: true as const, user };
}

/** Validasi server-side (Q11). Null = OK, string = pesan error. */
function validateItem(item: CatalogItem): string | null {
  if (!item.ProductID.trim()) return "ProductID wajib diisi.";
  if (!/^[A-Za-z0-9_-]+$/.test(item.ProductID)) return "ProductID: huruf/angka/_/- saja.";
  if (!item.Brand.trim()) return "Brand wajib diisi.";
  if (!item.Model.trim()) return "Model wajib diisi.";
  if (!item.Kategori.trim()) return "Kategori wajib diisi.";
  if (parseHargaToNumber(String(item.Harga)) <= 0) return "Harga tidak valid.";
  if (!Number.isInteger(item.Stok) || item.Stok < 0 || item.Stok > 2147483647)
    return "Stok harus angka 0 sampai 2147483647.";
  return null;
}

/** Upsert item (insert atau update by product_id). Q16-C. */
export async function saveCatalogItem(item: CatalogItem): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return { success: false, error: auth.error };

  const invalid = validateItem(item);
  if (invalid) return { success: false, error: invalid };

  const supabase = createServerClient();
  const hargaNumber = parseHargaToNumber(String(item.Harga));

  const { error } = await supabase
    .from("catalog_items")
    .upsert(
      {
        product_id: item.ProductID,
        kategori: item.Kategori,
        brand: item.Brand,
        model: item.Model,
        processor: item.Processor || null,
        ram: item.RAM || null,
        storage: item.Storage || null,
        harga: String(item.Harga),
        harga_number: hargaNumber,
        stok: item.Stok,
        foto_url: item.FotoURL || null,
        deskripsi: item.Deskripsi,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id" },
    );

  if (error) return { success: false, error: mapError(error.message, error.code) };

  revalidatePath("/");
  return { success: true };
}

/** Hapus item by product_id. Q16-C. */
export async function deleteCatalogItemAction(
  productId: string,
): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return { success: false, error: auth.error };
  if (!productId.trim() || !/^[A-Za-z0-9_-]+$/.test(productId))
    return { success: false, error: "ProductID tidak valid." };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("catalog_items")
    .delete()
    .eq("product_id", productId);

  if (error) return { success: false, error: mapError(error.message, error.code) };

  revalidatePath("/");
  return { success: true };
}

// MIME -> ext allowlist. Tolak svg/html (XSS inline storage). Magic-byte sniff di server.
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

/** Upload gambar ke Storage + update image_path DB. Rollback orphan. Q18. */
export async function uploadCatalogImage(
  productId: string,
  file: File,
  currentPath: string | null,
): Promise<ActionResult & { path?: string }> {
  const auth = await requireUser();
  if (!auth.ok) return { success: false, error: auth.error };
  if (!productId.trim() || !/^[A-Za-z0-9_-]+$/.test(productId))
    return { success: false, error: "ProductID tidak valid." };
  if (!file) return { success: false, error: "File kosong." };
  if (file.size > MAX_BYTES) return { success: false, error: "File maks 2MB." };
  const ext = MIME_EXT[file.type];
  if (!ext) return { success: false, error: "Hanya jpg/png/webp." };

  const supabase = createServerClient();
  const storagePath = `products/${productId}.${ext}`;

  // 1. Upload ke Storage (upsert overwrite).
  const { error: upErr } = await supabase.storage
    .from("catalog-images")
    .upload(storagePath, file, { upsert: true, contentType: file.type });
  if (upErr) return { success: false, error: mapError(upErr.message) };

  // 2. Update image_path di DB.
  const { error: dbErr } = await supabase
    .from("catalog_items")
    .update({ image_path: storagePath, updated_at: new Date().toISOString() })
    .eq("product_id", productId);

  if (dbErr) {
    // Rollback: hapus file orphan baru (Q18).
    await supabase.storage.from("catalog-images").remove([storagePath]);
    return { success: false, error: mapError(dbErr.message, dbErr.code) };
  }

  // 3. Hapus file lama kalau path beda (cleanup, Q18).
  if (currentPath && currentPath !== storagePath) {
    await supabase.storage.from("catalog-images").remove([currentPath]);
  }

  revalidatePath("/");
  return { success: true, path: storagePath };
}
