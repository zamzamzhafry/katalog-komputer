// Pure domain: EditState <-> CatalogItem mapping (Q5/Q6). Relative imports only (D4).
import { formatHarga, parseHargaToNumber } from "./format.ts";
import type { CatalogItem } from "./types";

export type EditState = {
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

/** CatalogItem -> form state. Harga number -> "Rp ..." string for input. */
export function toEditState(item: CatalogItem): EditState {
  return {
    ProductID: item.ProductID,
    Kategori: item.Kategori,
    Brand: item.Brand,
    Model: item.Model,
    Processor: item.Processor,
    RAM: item.RAM,
    Storage: item.Storage,
    Harga: item.Harga > 0 ? formatHarga(item.Harga) : "",
    Stok: String(item.Stok),
    FotoURL: item.FotoURL,
    Deskripsi: item.Deskripsi,
  };
}

/** Form state -> CatalogItem. Harga string -> number, Stok string -> int. */
export function fromEditState(edit: EditState): CatalogItem {
  return {
    ProductID: edit.ProductID,
    Kategori: edit.Kategori,
    Brand: edit.Brand,
    Model: edit.Model,
    Processor: edit.Processor,
    RAM: edit.RAM,
    Storage: edit.Storage,
    Harga: parseHargaToNumber(edit.Harga),
    Stok: Number.parseInt(edit.Stok, 10) || 0,
    FotoURL: edit.FotoURL,
    Deskripsi: edit.Deskripsi,
  };
}
