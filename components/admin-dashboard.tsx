"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CatalogItem } from "@/lib/types";
import { formatHarga } from "@/lib/format";
import { ImageUpload } from "@/components/image-upload";

interface AdminDashboardProps {
  items: CatalogItem[];
  onItemDeleted: (productId: string) => Promise<boolean> | boolean;
  onEditItem: (item: CatalogItem) => void;
}

export function AdminDashboard({ items, onItemDeleted, onEditItem }: AdminDashboardProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(productId: string) {
    if (!confirm("Hapus item " + productId + "? Aksi ini tidak bisa dibatalkan.")) {
      return;
    }
    setDeleting(productId);
    await onItemDeleted(productId);
    setDeleting(null);
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
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
                  Tidak ada item
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
                    {/* ponytail: currentPath null -> cleanup file lama skip. Tambah imagePath ke CatalogItem + mapRow kalau mau cleanup old file di upload (Q18). */}
                    <ImageUpload
                      productId={item.ProductID}
                      currentPath={null}
                      onUploaded={() => router.refresh()}
                    />
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="btn-edit"
                        type="button"
                        onClick={() => onEditItem(item)}
                      >
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
  );
}
