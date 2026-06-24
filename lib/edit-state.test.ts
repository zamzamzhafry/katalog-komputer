import { test } from "node:test";
import assert from "node:assert/strict";
import { toEditState, fromEditState } from "./edit-state.ts";
import type { CatalogItem } from "./types.ts";

const item: CatalogItem = {
  ProductID: "LAP-001",
  Kategori: "Laptop",
  Brand: "Acer",
  Model: "G14",
  Processor: "Ryzen 9",
  RAM: "16GB",
  Storage: "1TB",
  Harga: 26500000,
  Stok: 5,
  FotoURL: "https://example.com/x.jpg",
  Deskripsi: "gaming",
};

test("toEditState: Harga number -> formatted string", () => {
  const e = toEditState(item);
  assert.equal(e.Harga, "Rp 26.500.000");
  assert.equal(e.Stok, "5");
});

test("fromEditState: Harga string -> number", () => {
  const e = toEditState(item);
  const back = fromEditState(e);
  assert.equal(back.Harga, 26500000);
  assert.equal(back.Stok, 5);
  assert.equal(back.ProductID, item.ProductID);
});

test("round-trip: toEditState(fromEditState(toEditState(x))) stabil", () => {
  const e1 = toEditState(item);
  const back = fromEditState(e1);
  const e2 = toEditState(back);
  assert.deepEqual(e2, e1);
});

test("fromEditState: stok non-numeric -> 0", () => {
  const back = fromEditState({ ...toEditState(item), Stok: "abc" });
  assert.equal(back.Stok, 0);
});
