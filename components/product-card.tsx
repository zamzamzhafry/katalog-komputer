"use client";

import { motion } from "framer-motion";
import { CardImage, cardAnimation } from "@/components/catalog-modal";
import { formatHarga } from "@/lib/format";
import type { CatalogItem } from "@/lib/types";

interface ProductCardProps {
  item: CatalogItem;
  onOpenDetail: (item: CatalogItem) => void;
}

export function ProductCard({ item, onOpenDetail }: ProductCardProps) {
  return (
    <motion.article
      className="card"
      variants={cardAnimation}
      onClick={() => onOpenDetail(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(item);
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
          <span className="card-id">{item.ProductID}</span>
          <span className={`stock ${item.Stok > 0 ? "in" : "out"}`}>
            {item.Stok > 0 ? `Stok ${item.Stok}` : "Kosong"}
          </span>
        </div>
        <h2>{item.Brand}</h2>
        <h3>{item.Model}</h3>
        <p className="card-price">{formatHarga(item.Harga)}</p>
        <p className="card-tap">Klik kartu untuk detail</p>
      </div>
    </motion.article>
  );
}
