import { test } from "node:test";
import assert from "node:assert/strict";
import { formatHarga, parseHargaToNumber } from "./format.ts";

test("parseHargaToNumber: 'Rp 26.500.000' -> 26500000", () => {
  assert.equal(parseHargaToNumber("Rp 26.500.000"), 26500000);
});

test("parseHargaToNumber: '26500000' -> 26500000", () => {
  assert.equal(parseHargaToNumber("26500000"), 26500000);
});

test("parseHargaToNumber: '26.500.000' -> 26500000", () => {
  assert.equal(parseHargaToNumber("26.500.000"), 26500000);
});

test("parseHargaToNumber: 'N/A' -> 0", () => {
  assert.equal(parseHargaToNumber("N/A"), 0);
});

test("parseHargaToNumber: empty -> 0", () => {
  assert.equal(parseHargaToNumber(""), 0);
});

test("formatHarga: 26500000 -> 'Rp 26.500.000'", () => {
  assert.equal(formatHarga(26500000), "Rp 26.500.000");
});

test("formatHarga: 0 -> 'N/A'", () => {
  assert.equal(formatHarga(0), "N/A");
});

test("formatHarga: negative -> 'N/A'", () => {
  assert.equal(formatHarga(-100), "N/A");
});
