-- Migration 003: harga numerik (Q5) + spek nullable (Q6)
-- Depends on 001_create_catalog.sql being applied.

-- Q5: canonical numeric harga (rupiah senilai, tanpa "Rp"/titik)
alter table public.catalog_items
  add column if not exists harga_number bigint;

-- Backfill dari TEXT "Rp 26.500.000" -> 26500000. Gagal parse -> NULL -> display fallback ke TEXT.
update public.catalog_items
  set harga_number = nullif(
    regexp_replace(harga, '[^0-9]', '', 'g'), ''
  )::bigint
  where harga_number is null;

-- ponytail: drop kolom `harga` (TEXT) saat 100% row punya harga_number. Upgrade path: cek `select count(*) where harga_number is null and harga <> ''`.

-- Q6: processor/ram/storage nullable (sebelumnya NOT NULL default '')
-- Aksesoris tidak punya spek -> NULL, bukan "N/A"
alter table public.catalog_items alter column processor drop not null;
alter table public.catalog_items alter column ram drop not null;
alter table public.catalog_items alter column storage drop not null;
alter table public.catalog_items alter column processor drop default;
alter table public.catalog_items alter column ram drop default;
alter table public.catalog_items alter column storage drop default;

-- NOTE: wa_number (Q2 future per-kategori) deferred (YAGNI). Tambah satu baris migration saat per-kategori jalan.
-- NOTE: condition + warranty (Q6) deferred. Tambah saat butuh barang bekas/rekondisi.
