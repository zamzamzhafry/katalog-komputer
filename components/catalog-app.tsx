"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { CatalogModal } from "@/components/catalog-modal";
import { ProductCard } from "@/components/product-card";
import { CatalogToolbar } from "@/components/catalog-toolbar";
import { CatalogStats } from "@/components/catalog-stats";
import { ErrorBanner } from "@/components/error-banner";
import { ToastProvider, useToast } from "@/components/toast";
import { useCatalogData } from "@/lib/hooks/use-catalog-data";
import { useCatalogUI } from "@/lib/hooks/use-catalog-ui";
import { formatHarga } from "@/lib/format";
import { getUser } from "@/lib/supabase/auth";
import type { CatalogItem } from "@/lib/types";

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "628123123123";

function redirectToWhatsApp(item: CatalogItem): void {
  const message = [
    "Halo, saya tertarik dengan produk berikut:",
    `ID: ${item.ProductID}`,
    `Produk: ${item.Brand} ${item.Model}`,
    `Harga: ${formatHarga(item.Harga)}`,
    `Stok: ${item.Stok}`,
    `Spesifikasi: ${item.Processor}, ${item.RAM}, ${item.Storage}`,
  ]
    .filter((line) => line.length > 0)
    .join("\n");

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function CatalogAppInner({
  initialItems,
  initialError,
}: {
  initialItems: CatalogItem[];
  initialError: boolean;
}) {
  const { toast } = useToast();
  const { items, setItems, categories, summary } = useCatalogData(initialItems);
  const ui = useCatalogUI({ items, setItems, onToast: toast });
  const [isAdmin, setIsAdmin] = useState(false);

  // Cek admin (client) -> tampilkan link "Dashboard" saja, bukan inline edit.
  useEffect(() => {
    getUser().then(({ user }) => setIsAdmin(Boolean(user)));
  }, []);

  return (
    <main className="shell">
      <a href="#main-content" className="skip-link">Lewati ke konten</a>
      {isAdmin && (
        <div className="topbar">
          <a className="ghost" href="/dashboard">Dashboard Admin</a>
        </div>
      )}

      <section className="container" id="main-content">
        <h1 className="page-title">Katalog Komputer &amp; Laptop</h1>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <CatalogStats summary={summary} />
        </motion.div>

        <CatalogToolbar
          query={ui.query}
          setQuery={ui.setQuery}
          category={ui.category}
          setCategory={ui.setCategory}
          categories={categories}
        />

        <motion.section
          className="grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
        >
          {ui.filteredItems.map((item) => (
            <ProductCard
              key={item.ProductID}
              item={item}
              onOpenDetail={ui.actions.openDetail}
            />
          ))}
        </motion.section>

        <footer className="footer">Katalog Komputer & Laptop</footer>
      </section>

      <ErrorBanner show={initialError} hasCache={items.length > 0} />

      <CatalogModal
        editValue={ui.editValue}
        detailItem={ui.detailItem}
        saving={ui.saving}
        onEditChange={ui.actions.updateEditValue}
        onClose={() => {
          ui.actions.closeEdit();
          ui.actions.closeDetail();
        }}
        onSave={ui.actions.saveEdit}
        onOrder={(item) => {
          redirectToWhatsApp(item);
          ui.actions.closeDetail();
        }}
      />
    </main>
  );
}

export function CatalogApp(props: {
  initialItems: CatalogItem[];
  initialError: boolean;
}) {
  return (
    <ToastProvider>
      <CatalogAppInner {...props} />
    </ToastProvider>
  );
}
