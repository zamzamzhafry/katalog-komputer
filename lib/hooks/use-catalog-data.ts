"use client";

import { useEffect, useMemo, useState } from "react";
import { readCatalogStorage, writeCatalogStorage } from "@/lib/storage";
import type { CatalogItem } from "@/lib/types";

/**
 * Data hook (Q14). Items dari SSR initialItems, persist ke localStorage read-only cache (Q12).
 * Kalau initialItems kosong, coba cache offline (D5: no seed fallback).
 */
export function useCatalogData(initialItems: CatalogItem[]) {
  const [items, setItems] = useState<CatalogItem[]>(initialItems);

  // Mount: kalau SSR kosong, baca cache offline (read-only, Q12).
  useEffect(() => {
    if (initialItems.length > 0) return;
    const cached = readCatalogStorage();
    if (cached && cached.length > 0) {
      setItems(cached);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist cache saat items berubah (read-only cache: write untuk view offline, Q12).
  useEffect(() => {
    if (items.length > 0) {
      writeCatalogStorage(items);
    }
  }, [items]);

  const categories = useMemo(() => {
    const source = new Set(items.map((item) => item.Kategori));
    return ["Semua", ...Array.from(source)];
  }, [items]);

  const summary = useMemo(() => {
    const inStock = items.filter((item) => item.Stok > 0).length;
    return {
      total: items.length,
      inStock,
      outOfStock: items.length - inStock,
    };
  }, [items]);

  return { items, setItems, categories, summary };
}
