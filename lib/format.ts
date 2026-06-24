// Pure domain: format & parse harga (Q5). Relative imports only (node --test, D4).

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 26500000 -> "Rp 26.500.000". 0/negatif -> "N/A". NBSP dinormalisasi ke spasi. */
export function formatHarga(n: number): string {
  if (n <= 0) return "N/A";
  // Intl id-ID pake NBSP ( ) antara "Rp" dan angka. Normalisasi ke spasi biasa.
  return rupiah.format(n).split(" ").join(" ");
}

/** "Rp 26.500.000" | "26500000" | "26.500.000" -> 26500000. Non-digit -> 0. */
export function parseHargaToNumber(s: string): number {
  if (!s) return 0;
  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isSafeInteger(n) ? n : 0;
}
