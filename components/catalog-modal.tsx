"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { formatHarga, parseHargaToNumber } from "@/lib/format";
import type { CatalogItem } from "@/lib/types";
import type { EditState } from "@/lib/edit-state";

interface CatalogModalProps {
  editValue: EditState | null;
  detailItem: CatalogItem | null;
  onEditChange: (patch: Partial<EditState>) => void;
  onClose: () => void;
  onSave: () => void;
  onOrder: (item: CatalogItem) => void;
  saving?: boolean;
}

export function CatalogModal({
  editValue,
  detailItem,
  onEditChange,
  onClose,
  onSave,
  onOrder,
  saving,
}: CatalogModalProps) {
  const open = Boolean(editValue || detailItem);

  // Escape to close (a11y: keyboard users can't click backdrop).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-wrap"
          role="dialog"
          aria-modal="true"
          aria-label={editValue ? "Edit item" : "Detail produk"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            {editValue ? (
              <EditForm
                editValue={editValue}
                onEditChange={onEditChange}
                onClose={onClose}
                onSave={onSave}
                saving={saving}
              />
            ) : null}

            {detailItem ? (
              <DetailPanel item={detailItem} onClose={onClose} onOrder={onOrder} />
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function EditForm({
  editValue,
  onEditChange,
  onClose,
  onSave,
  saving,
}: {
  editValue: EditState;
  onEditChange: (patch: Partial<EditState>) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    // Client validation (Q11).
    if (!editValue.ProductID.trim()) return setError("ProductID wajib diisi.");
    if (!editValue.Brand.trim()) return setError("Brand wajib diisi.");
    if (!editValue.Model.trim()) return setError("Model wajib diisi.");
    if (!editValue.Kategori.trim()) return setError("Kategori wajib diisi.");
    if (parseHargaToNumber(editValue.Harga) <= 0)
      return setError("Harga tidak valid (contoh: Rp 26.500.000).");
    if (!/^\d+$/.test(editValue.Stok) || Number(editValue.Stok) < 0)
      return setError("Stok harus angka ≥ 0.");
    setError(null);
    onSave();
  }

  return (
    <>
      <h4>Hot Edit Item</h4>
      <div className="form-grid">
        <InputField label="ProductID" value={editValue.ProductID} onChange={(v) => onEditChange({ ProductID: v })} />
        <InputField label="Kategori" value={editValue.Kategori} onChange={(v) => onEditChange({ Kategori: v })} />
        <InputField label="Brand" value={editValue.Brand} onChange={(v) => onEditChange({ Brand: v })} />
        <InputField label="Model" value={editValue.Model} onChange={(v) => onEditChange({ Model: v })} />
        <InputField label="Processor" value={editValue.Processor} onChange={(v) => onEditChange({ Processor: v })} />
        <InputField label="RAM" value={editValue.RAM} onChange={(v) => onEditChange({ RAM: v })} />
        <InputField label="Storage" value={editValue.Storage} onChange={(v) => onEditChange({ Storage: v })} />
        <InputField label="Harga" value={editValue.Harga} onChange={(v) => onEditChange({ Harga: v })} />
        <InputField label="Stok" value={editValue.Stok} onChange={(v) => onEditChange({ Stok: v })} />
        <InputField label="FotoURL" value={editValue.FotoURL} onChange={(v) => onEditChange({ FotoURL: v })} />
        <label className="field textarea-field">
          <span>Deskripsi</span>
          <textarea
            value={editValue.Deskripsi}
            onChange={(event) => onEditChange({ Deskripsi: event.target.value })}
          />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions">
        <button className="ghost" type="button" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button className="primary" type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Save changes"}
        </button>
      </div>
    </>
  );
}

function DetailPanel({
  item,
  onClose,
  onOrder,
}: {
  item: CatalogItem;
  onClose: () => void;
  onOrder: (item: CatalogItem) => void;
}) {
  return (
    <>
      <div className="detail-image">
        <CardImage src={item.FotoURL} alt={`${item.Brand} ${item.Model}`} productId={item.ProductID} />
      </div>
      <h4>{item.Brand} {item.Model}</h4>
      <p className="order-intro">{formatHarga(item.Harga)}</p>
      <p className="detail-desc">{item.Deskripsi || "Tanpa deskripsi"}</p>
      <dl className="specs detail-specs">
        <Spec label="Kategori" value={item.Kategori} />
        <Spec label="CPU" value={item.Processor} />
        <Spec label="RAM" value={item.RAM} />
        <Spec label="Storage" value={item.Storage} />
        <Spec label="Stok" value={String(item.Stok)} />
        <Spec label="ID Produk" value={item.ProductID} />
      </dl>
      <div className="modal-actions">
        <button className="ghost" type="button" onClick={onClose}>
          Tutup
        </button>
        <button
          className="primary wa-order-btn"
          type="button"
          onClick={() => onOrder(item)}
        >
          <WhatsAppIcon />
          <span>Pesan Sekarang</span>
        </button>
      </div>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M27.6 4.4A15.87 15.87 0 0 0 16.1 0C7.3 0 .2 7.1.2 15.9c0 2.8.7 5.6 2.1 8L0 32l8.3-2.2a15.8 15.8 0 0 0 7.6 1.9h.1c8.8 0 15.9-7.1 15.9-15.9A15.8 15.8 0 0 0 27.6 4.4Zm-11.5 24.6h-.1a13 13 0 0 1-6.6-1.8l-.5-.3-4.9 1.3 1.3-4.8-.3-.5a12.9 12.9 0 0 1-2-7c0-7.2 5.8-13 13-13 3.5 0 6.8 1.4 9.2 3.8a13 13 0 0 1-9.1 22.3Zm7.1-9.7c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.5-.2-.7.2-.2.4-.8 1.2-1 1.4-.2.2-.3.2-.7.1-.4-.2-1.5-.5-2.8-1.7-1-1-1.7-2.1-1.9-2.5-.2-.4 0-.5.2-.7l.5-.5c.2-.2.3-.3.4-.5.1-.2 0-.4 0-.6 0-.2-.7-1.8-1-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.1 1.1-1.1 2.7s1.1 3.1 1.2 3.3c.2.2 2.2 3.5 5.4 4.9.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.2-.3-.2-.7-.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

const cardAnimation = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function CardImage({
  src,
  alt,
  productId,
}: {
  src: string;
  alt: string;
  productId: string;
}) {
  const localBase = `/img/${productId}`;
  const candidates = [
    src,
    `${localBase}.webp`,
    `${localBase}.jpg`,
    `${localBase}.png`,
    "https://placehold.co/1200x800/141925/e3ebff?text=No+Image",
  ];
  const [index, setIndex] = useState(0);
  const imageSrc = candidates[index] ?? candidates[candidates.length - 1];

  return (
    <div className="image-wrap">
      <Image
        src={imageSrc}
        alt={alt}
        width={1200}
        height={800}
        className="image"
        onError={() =>
          setIndex((current) => Math.min(current + 1, candidates.length - 1))
        }
        unoptimized
      />
    </div>
  );
}

export { cardAnimation };
