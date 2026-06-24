// Pure domain: filter katalog (Q14/Q15/D7). Relative imports only (node --test, D4).
import type { CatalogItem } from "./types";

export function filterItems(
  items: CatalogItem[],
  query: string,
  category: string,
): CatalogItem[] {
  const q = query.toLowerCase().trim();
  return items.filter((item) => {
    const matchCategory = category === "Semua" || item.Kategori === category;
    if (!matchCategory) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = [
      item.ProductID,
      item.Brand,
      item.Model,
      item.Processor,
      item.Deskripsi,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
