import { test } from "node:test";
import assert from "node:assert/strict";
import { filterItems } from "./filter.ts";
import type { CatalogItem } from "./types.ts";

const items: CatalogItem[] = [
  { ProductID: "LAP-001", Kategori: "Laptop", Brand: "Acer", Model: "G14", Processor: "Ryzen 9", RAM: "16GB", Storage: "1TB", Harga: 26500000, Stok: 5, FotoURL: "", Deskripsi: "gaming" },
  { ProductID: "PC-001", Kategori: "PC", Brand: "Custom", Model: "Rakitan", Processor: "i5", RAM: "16GB", Storage: "1TB", Harga: 14200000, Stok: 3, FotoURL: "", Deskripsi: "mid" },
  { ProductID: "ACC-001", Kategori: "Aksesoris", Brand: "Logitech", Model: "MX3", Processor: "", RAM: "", Storage: "", Harga: 1650000, Stok: 25, FotoURL: "", Deskripsi: "mouse" },
];

test("filterItems: empty query returns all", () => {
  assert.equal(filterItems(items, "", "Semua").length, 3);
});

test("filterItems: query 'acer' matches Acer", () => {
  const r = filterItems(items, "acer", "Semua");
  assert.equal(r.length, 1);
  assert.equal(r[0].Brand, "Acer");
});

test("filterItems: category filter Laptop", () => {
  const r = filterItems(items, "", "Laptop");
  assert.equal(r.length, 1);
  assert.equal(r[0].ProductID, "LAP-001");
});

test("filterItems: query hits Deskripsi", () => {
  const r = filterItems(items, "mouse", "Semua");
  assert.equal(r.length, 1);
  assert.equal(r[0].ProductID, "ACC-001");
});

test("filterItems: category + query combined", () => {
  const r = filterItems(items, "rakitan", "PC");
  assert.equal(r.length, 1);
  assert.equal(r[0].ProductID, "PC-001");
});
