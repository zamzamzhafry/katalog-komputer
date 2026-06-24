"use client";

import { useCallback, useMemo, useState } from "react";
import { filterItems } from "@/lib/filter";
import { toEditState, fromEditState } from "@/lib/edit-state";
import type { EditState } from "@/lib/edit-state";
import { saveCatalogItem, deleteCatalogItemAction } from "@/app/actions/catalog";
import type { CatalogItem } from "@/lib/types";

type SetItems = React.Dispatch<React.SetStateAction<CatalogItem[]>>;

/**
 * UI hook (Q14). Search/category/edit/detail state + actions.
 * saveEdit -> Server Action (Q16-C), bukan client admin.ts.
 */
export function useCatalogUI({
  items,
  setItems,
  onToast,
}: {
  items: CatalogItem[];
  setItems: SetItems;
  onToast: (msg: string, kind?: "success" | "error" | "info") => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<EditState | null>(null);
  const [detailItem, setDetailItem] = useState<CatalogItem | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(
    () => filterItems(items, query, category),
    [items, query, category],
  );

  const openEdit = useCallback((item: CatalogItem) => {
    setEditingId(item.ProductID);
    setEditValue(toEditState(item));
  }, []);

  const closeEdit = useCallback(() => {
    setEditingId(null);
    setEditValue(null);
  }, []);

  const updateEditValue = useCallback((patch: Partial<EditState>) => {
    setEditValue((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editValue || !editingId) return;
    setSaving(true);
    const item = fromEditState(editValue);
    const { success, error } = await saveCatalogItem(item);
    setSaving(false);
    if (!success) {
      onToast(error ?? "Gagal simpan.", "error");
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.ProductID === editingId ? { ...i, ...item } : i)),
    );
    onToast("Item disimpan.", "success");
    setEditingId(null);
    setEditValue(null);
  }, [editValue, editingId, setItems, onToast]);

  const deleteItem = useCallback(
    async (productId: string) => {
      const { success, error } = await deleteCatalogItemAction(productId);
      if (!success) {
        onToast(error ?? "Gagal hapus.", "error");
        return false;
      }
      setItems((prev) => prev.filter((i) => i.ProductID !== productId));
      onToast("Item dihapus.", "success");
      return true;
    },
    [setItems, onToast],
  );

  const openDetail = useCallback((item: CatalogItem) => {
    setDetailItem(item);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailItem(null);
  }, []);

  return {
    query,
    setQuery,
    category,
    setCategory,
    filteredItems,
    editingId,
    editValue,
    detailItem,
    showDashboard,
    setShowDashboard,
    saving,
    actions: {
      openEdit,
      closeEdit,
      updateEditValue,
      saveEdit,
      deleteItem,
      openDetail,
      closeDetail,
    },
  };
}
