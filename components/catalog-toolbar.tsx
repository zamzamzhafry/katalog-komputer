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
      <input
        className="search"
        placeholder="Cari brand, model, processor..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select
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
      {/* Q12: resetToSeed button commented out (HOT EDIT legacy hide). */}
      {/* <button className="ghost" onClick={onReset} type="button">Reset sample</button> */}
    </motion.section>
  );
}
