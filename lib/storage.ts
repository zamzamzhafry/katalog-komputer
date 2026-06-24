import type { CatalogItem } from "@/lib/types";

export const STORAGE_KEY = "katalog-komputer-v1";

export function readCatalogStorage(): CatalogItem[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter(isCatalogItem);
  } catch {
    return null;
  }
}

export function writeCatalogStorage(items: CatalogItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function isCatalogItem(value: unknown): value is CatalogItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CatalogItem>;

  return (
    typeof item.ProductID === "string" &&
    typeof item.Kategori === "string" &&
    typeof item.Brand === "string" &&
    typeof item.Model === "string" &&
    typeof item.Processor === "string" &&
    typeof item.RAM === "string" &&
    typeof item.Storage === "string" &&
    (typeof item.Harga === "number" || typeof item.Harga === "string") &&
    typeof item.Stok === "number" &&
    typeof item.FotoURL === "string" &&
    typeof item.Deskripsi === "string"
  );
}
