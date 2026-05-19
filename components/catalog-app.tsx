"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { parseCatalogTsv } from "@/lib/parse";
import { seedTsv } from "@/lib/seed";
import { readCatalogStorage, writeCatalogStorage } from "@/lib/storage";
import { fetchCatalog } from "@/lib/supabase/catalog";
import { getUser } from "@/lib/supabase/auth";
import { updateCatalogItem } from "@/lib/supabase/admin";
import { LoginPanel } from "@/components/login-panel";
import { AdminDashboard } from "@/components/admin-dashboard";
import type { User } from "@supabase/supabase-js";
import type { CatalogItem } from "@/lib/types";

type EditState = {
  ProductID: string;
  Kategori: string;
  Brand: string;
  Model: string;
  Processor: string;
  RAM: string;
  Storage: string;
  Harga: string;
  Stok: string;
  FotoURL: string;
  Deskripsi: string;
};

const cardAnimation = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function CatalogApp() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<EditState | null>(null);
  const [detailItem, setDetailItem] = useState<CatalogItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      const remote = await fetchCatalog();
      if (remote && remote.length > 0) {
        setItems(remote);
        return;
      }

      const saved = readCatalogStorage();
      if (saved && saved.length > 0) {
        setItems(saved);
        return;
      }

      const seeded = parseCatalogTsv(seedTsv);
      setItems(seeded);
      writeCatalogStorage(seeded);
    }
    loadCatalog();
    checkAuth();
  }, []);

  async function checkAuth() {
    const { user: currentUser } = await getUser();
    setUser(currentUser ?? null);
    if (currentUser) {
      setEditMode(true);
    } else {
      setEditMode(false);
      setShowDashboard(false);
    }
  }

  async function reloadFromSupabase() {
    const remote = await fetchCatalog();
    if (remote && remote.length > 0) {
      setItems(remote);
    }
  }

  useEffect(() => {
    if (items.length > 0) {
      writeCatalogStorage(items);
    }
  }, [items]);

  const categories = useMemo(() => {
    const source = new Set(items.map((item) => item.Kategori));
    return ["Semua", ...Array.from(source)];
  }, [items]);

  const filteredItems = useMemo(() => {
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
  }, [items, query, category]);

  const summary = useMemo(() => {
    const inStock = items.filter((item) => item.Stok > 0).length;
    return {
      total: items.length,
      inStock,
      outOfStock: items.length - inStock,
    };
  }, [items]);

  function openEdit(item: CatalogItem): void {
    setEditingId(item.ProductID);
    setEditValue({
      ProductID: item.ProductID,
      Kategori: item.Kategori,
      Brand: item.Brand,
      Model: item.Model,
      Processor: item.Processor,
      RAM: item.RAM,
      Storage: item.Storage,
      Harga: item.Harga,
      Stok: String(item.Stok),
      FotoURL: item.FotoURL,
      Deskripsi: item.Deskripsi,
    });
  }

  function closeEdit(): void {
    setEditingId(null);
    setEditValue(null);
  }

  async function saveEdit(): Promise<void> {
    if (!editValue || !editingId) {
      return;
    }

    const nextStock = Number.parseInt(editValue.Stok, 10) || 0;

    const updatedItem: CatalogItem = {
      ProductID: editValue.ProductID,
      Kategori: editValue.Kategori,
      Brand: editValue.Brand,
      Model: editValue.Model,
      Processor: editValue.Processor,
      RAM: editValue.RAM,
      Storage: editValue.Storage,
      Harga: editValue.Harga,
      Stok: nextStock,
      FotoURL: editValue.FotoURL,
      Deskripsi: editValue.Deskripsi,
    };

    // Write to Supabase if authenticated
    if (user) {
      const { success, error } = await updateCatalogItem(updatedItem);
      if (!success) {
        alert("Gagal simpan ke Supabase: " + (error ?? "Unknown error"));
        return;
      }
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.ProductID !== editingId) {
          return item;
        }
        return { ...item, ...updatedItem };
      }),
    );

    closeEdit();
  }

  function resetToSeed(): void {
    const seeded = parseCatalogTsv(seedTsv);
    setItems(seeded);
    writeCatalogStorage(seeded);
    closeEdit();
  }

  function openDetail(item: CatalogItem): void {
    setDetailItem(item);
  }

  function closeDetail(): void {
    setDetailItem(null);
  }

  function redirectToWhatsApp(item: CatalogItem): void {
    if (!item) {
      return;
    }

    const message = [
      "Halo, saya tertarik dengan produk berikut:",
      `ID: ${item.ProductID}`,
      `Produk: ${item.Brand} ${item.Model}`,
      `Harga: ${item.Harga}`,
      `Stok: ${item.Stok}`,
      `Spesifikasi: ${item.Processor}, ${item.RAM}, ${item.Storage}`,
    ]
      .filter((line) => line.length > 0)
      .join("\n");

    const url = `https://wa.me/628123123123?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    closeDetail();
  }

  return (
    <main className="shell">
      <LoginPanel user={user} onAuthChange={checkAuth} />
      {user && (
        <button
          className="primary"
          style={{ marginBottom: "1rem" }}
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
        >
          {showDashboard ? "Tutup Dashboard" : "Admin Dashboard"}
        </button>
      )}
      {showDashboard && user && (
        <AdminDashboard
          items={items}
          onItemUpdated={reloadFromSupabase}
          onEditItem={openEdit}
        />
      )}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <button
        className={`hot-edit-fab ${editMode ? "active" : ""}`}
        onClick={() => setEditMode((value) => !value)}
        type="button"
      >
        {editMode ? "HOT EDIT: ON" : "HOT EDIT"}
      </button>

      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="stats">
            <StatCard title="Total Item" value={String(summary.total)} />
            <StatCard title="Ready Stock" value={String(summary.inStock)} />
            <StatCard title="Out of Stock" value={String(summary.outOfStock)} />
          </div>
        </motion.div>

        <motion.section
          className="toolbar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <input
            className="search"
            placeholder="Cari brand, model, processor..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button className="ghost" onClick={resetToSeed} type="button">
            Reset sample
          </button>
        </motion.section>

        <motion.section
          className="grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
        >
          {filteredItems.map((item) => (
            <motion.article
              key={item.ProductID}
              className="card"
              variants={cardAnimation}
              onClick={() => openDetail(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDetail(item);
                }
              }}
            >
              <CardImage
                src={item.FotoURL}
                alt={`${item.Brand} ${item.Model}`}
                productId={item.ProductID}
              />
              <div className="card-body">
                <div className="card-head">
                  <span className="pill">{item.Kategori}</span>
                  <span className={`stock ${item.Stok > 0 ? "in" : "out"}`}>
                    {item.Stok > 0 ? `Stok ${item.Stok}` : "Kosong"}
                  </span>
                </div>
                <h2>{item.Brand}</h2>
                <h3>{item.Model}</h3>
                <p className="card-price">{item.Harga}</p>
                <p className="card-tap">Klik kartu untuk detail</p>
                <div className="actions">
                  {editMode ? (
                    <button
                      className="primary"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(item);
                      }}
                    >
                      Edit
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.section>

        <footer className="footer">Katalog Komputer & Laptop</footer>
      </section>

      <AnimatePresence>
        {editValue || detailItem ? (
          <motion.div
            className="modal-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              closeEdit();
              closeDetail();
            }}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              {editValue ? (
                <>
                  <h4>Hot Edit Item</h4>
                  <div className="form-grid">
                    <InputField
                      label="ProductID"
                      value={editValue.ProductID}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, ProductID: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="Kategori"
                      value={editValue.Kategori}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, Kategori: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="Brand"
                      value={editValue.Brand}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, Brand: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="Model"
                      value={editValue.Model}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, Model: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="Processor"
                      value={editValue.Processor}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, Processor: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="RAM"
                      value={editValue.RAM}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, RAM: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="Storage"
                      value={editValue.Storage}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, Storage: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="Harga"
                      value={editValue.Harga}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, Harga: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="Stok"
                      value={editValue.Stok}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, Stok: value } : prev,
                        )
                      }
                    />
                    <InputField
                      label="FotoURL"
                      value={editValue.FotoURL}
                      onChange={(value) =>
                        setEditValue((prev) =>
                          prev ? { ...prev, FotoURL: value } : prev,
                        )
                      }
                    />
                    <label className="field textarea-field">
                      <span>Deskripsi</span>
                      <textarea
                        value={editValue.Deskripsi}
                        onChange={(event) =>
                          setEditValue((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  Deskripsi: event.target.value,
                                }
                              : prev,
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button className="ghost" type="button" onClick={closeEdit}>
                      Cancel
                    </button>
                    <button
                      className="primary"
                      type="button"
                      onClick={saveEdit}
                    >
                      Save changes
                    </button>
                  </div>
                </>
              ) : null}

              {detailItem ? (
                <>
                  <div className="detail-image">
                    <CardImage
                      src={detailItem.FotoURL}
                      alt={`${detailItem.Brand} ${detailItem.Model}`}
                      productId={detailItem.ProductID}
                    />
                  </div>
                  <h4>
                    {detailItem.Brand} {detailItem.Model}
                  </h4>
                  <p className="order-intro">{detailItem.Harga}</p>
                  <p className="detail-desc">
                    {detailItem.Deskripsi || "Tanpa deskripsi"}
                  </p>
                  <dl className="specs detail-specs">
                    <Spec label="Kategori" value={detailItem.Kategori} />
                    <Spec label="CPU" value={detailItem.Processor} />
                    <Spec label="RAM" value={detailItem.RAM} />
                    <Spec label="Storage" value={detailItem.Storage} />
                    <Spec label="Stok" value={String(detailItem.Stok)} />
                    <Spec label="ID Produk" value={detailItem.ProductID} />
                  </dl>
                  <div className="modal-actions">
                    <button
                      className="ghost"
                      type="button"
                      onClick={closeDetail}
                    >
                      Tutup
                    </button>
                    <button
                      className="primary wa-order-btn"
                      type="button"
                      onClick={() => redirectToWhatsApp(detailItem)}
                    >
                      <WhatsAppIcon />
                      <span>Pesan Sekarang</span>
                    </button>
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
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

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M27.6 4.4A15.87 15.87 0 0 0 16.1 0C7.3 0 .2 7.1.2 15.9c0 2.8.7 5.6 2.1 8L0 32l8.3-2.2a15.8 15.8 0 0 0 7.6 1.9h.1c8.8 0 15.9-7.1 15.9-15.9A15.8 15.8 0 0 0 27.6 4.4Zm-11.5 24.6h-.1a13 13 0 0 1-6.6-1.8l-.5-.3-4.9 1.3 1.3-4.8-.3-.5a12.9 12.9 0 0 1-2-7c0-7.2 5.8-13 13-13 3.5 0 6.8 1.4 9.2 3.8a13 13 0 0 1-9.1 22.3Zm7.1-9.7c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.5-.2-.7.2-.2.4-.8 1.2-1 1.4-.2.2-.3.2-.7.1-.4-.2-1.5-.5-2.8-1.7-1-1-1.7-2.1-1.9-2.5-.2-.4 0-.5.2-.7l.5-.5c.2-.2.3-.3.4-.5.1-.2 0-.4 0-.6 0-.2-.7-1.8-1-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.1 1.1-1.1 2.7s1.1 3.1 1.2 3.3c.2.2 2.2 3.5 5.4 4.9.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.2-.3-.2-.7-.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CardImage({
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
