"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CatalogItem } from "@/lib/types";
import { formatHarga } from "@/lib/format";
import { toEditState, fromEditState } from "@/lib/edit-state";
import type { EditState } from "@/lib/edit-state";
import { saveCatalogItem, deleteCatalogItemAction } from "@/app/actions/catalog";
import { ImageUpload } from "@/components/image-upload";
import { CatalogModal } from "@/components/catalog-modal";
import { useToast } from "@/components/toast";
import { ToastProvider } from "@/components/toast";

export function DashboardView({ items, userEmail }: { items: CatalogItem[]; userEmail: string }) {
  return (
    <ToastProvider>
      <DashboardInner items={items} userEmail={userEmail} />
    </ToastProvider>
  );
}

function DashboardInner({ items, userEmail }: { items: CatalogItem[]; userEmail: string }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<EditState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function openEdit(item: CatalogItem) {
    setEditingId(item.ProductID);
    setEditValue(toEditState(item));
  }

  function openNew() {
    setEditingId(null);
    setEditValue({
      ProductID: "",
      Kategori: "",
      Brand: "",
      Model: "",
      Processor: "",
      RAM: "",
      Storage: "",
      Harga: "",
      Stok: "0",
      FotoURL: "",
      Deskripsi: "",
    });
  }

  function closeEdit() {
    setEditingId(null);
    setEditValue(null);
  }

  function updateEditValue(patch: Partial<EditState>) {
    setEditValue((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function saveEdit() {
    if (!editValue) return;
    setSaving(true);
    const item = fromEditState(editValue);
    const { success, error } = await saveCatalogItem(item);
    setSaving(false);
    if (!success) {
      toast(error ?? "Gagal simpan.", "error");
      return;
    }
    toast(editingId ? "Item disimpan." : "Item ditambahkan.", "success");
    closeEdit();
    router.refresh();
  }

  async function handleDelete(productId: string) {
    if (!confirm("Hapus item " + productId + "? Tidak bisa dibatalkan.")) return;
    setDeleting(productId);
    const { success, error } = await deleteCatalogItemAction(productId);
    setDeleting(null);
    if (!success) {
      toast(error ?? "Gagal hapus.", "error");
      return;
    }
    toast("Item dihapus.", "success");
    router.refresh();
  }

  async function handleLogout() {
    const { signOut } = await import("@/lib/supabase/auth");
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="shell">
      <header className="dash-head">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <span className="admin-badge">Admin: {userEmail}</span>
        </div>
        <div className="dash-actions">
          <button className="primary" type="button" onClick={openNew}>
            + Tambah Item
          </button>
          <a className="ghost" href="/">Lihat Katalog</a>
          <button className="btn-delete" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-dashboard">
        <h2>Daftar Produk ({items.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>ID</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Upload</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="admin-empty">
                    Tidak ada item. Klik &ldquo;+ Tambah Item&rdquo;.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.ProductID}>
                    <td>
                      <Image
                        src={item.FotoURL || "https://placehold.co/96x72/141925/e3ebff?text=No"}
                        alt={item.Model}
                        width={48}
                        height={36}
                        className="admin-thumb"
                        unoptimized
                      />
                    </td>
                    <td>{item.ProductID}</td>
                    <td>{item.Brand}</td>
                    <td>{item.Model}</td>
                    <td>{item.Kategori}</td>
                    <td>{formatHarga(item.Harga)}</td>
                    <td>
                      <span className={"stock-badge " + (item.Stok > 0 ? "in" : "out")}>
                        {item.Stok > 0 ? item.Stok : "Kosong"}
                      </span>
                    </td>
                    <td>
                      <ImageUpload
                        productId={item.ProductID}
                        currentPath={null}
                        onUploaded={() => router.refresh()}
                      />
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn-edit" type="button" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          type="button"
                          onClick={() => handleDelete(item.ProductID)}
                          disabled={deleting === item.ProductID}
                        >
                          {deleting === item.ProductID ? "..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CatalogModal
        editValue={editValue}
        detailItem={null}
        saving={saving}
        onEditChange={updateEditValue}
        onClose={closeEdit}
        onSave={saveEdit}
        onOrder={() => {}}
      />
    </main>
  );
}
