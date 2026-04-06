import { convertDriveLink } from "@/lib/drive";
import type { CatalogItem } from "@/lib/types";

export function parseCatalogTsv(source: string): CatalogItem[] {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length <= 1) {
    return [];
  }

  const rows = lines.slice(1);

  return rows
    .map((row) => {
      const cols = row.split("\t");
      const productId = cols[0] ?? "";

      return {
        ProductID: productId,
        Kategori: cols[1] ?? "",
        Brand: cols[2] ?? "",
        Model: cols[3] ?? "",
        Processor: cols[4] ?? "",
        RAM: cols[5] ?? "",
        Storage: cols[6] ?? "",
        Harga: cols[7] ?? "",
        Stok: Number.parseInt(cols[8] ?? "0", 10) || 0,
        FotoURL: convertDriveLink(cols[9] ?? ""),
        Deskripsi: cols[10] ?? ""
      } satisfies CatalogItem;
    })
    .filter((item) => item.ProductID !== "");
}
