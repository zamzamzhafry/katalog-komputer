"use client";

import { motion } from "framer-motion";

interface CatalogToolbarProps {
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  categories: string[];
}

export function CatalogToolbar({
  query,
  setQuery,
  category,
  setCategory,
  categories,
}: CatalogToolbarProps) {
  return (
    <motion.section
      className="toolbar"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <label className="field" style={{ display: "contents" }}>
        <span className="sr-only">Cari produk</span>
        <input
          id="catalog-search"
          className="search"
          placeholder="Cari brand, model, processor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <label className="field" style={{ display: "contents" }}>
        <span className="sr-only">Filter kategori</span>
        <select
          id="catalog-category"
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </motion.section>
  );
}
