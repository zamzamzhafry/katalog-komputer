-- Migration: create catalog_items table and public storage bucket
-- Run this in your Supabase SQL Editor or via CLI

-- 1. Create table
create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  product_id text unique not null,
  kategori text not null default '',
  brand text not null default '',
  model text not null default '',
  processor text not null default '',
  ram text not null default '',
  storage text not null default '',
  harga text not null default '',
  stok integer not null default 0,
  foto_url text,
  image_path text,
  deskripsi text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable RLS
alter table public.catalog_items enable row level security;

-- 3. Public read policy (anon can browse catalog)
create policy "Public read catalog"
  on public.catalog_items
  for select
  to anon, authenticated
  using (true);

-- 4. Grant read access to anon
grant select on public.catalog_items to anon;
grant select, insert, update, delete on public.catalog_items to authenticated;

-- 5. Create public storage bucket for product images
insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do nothing;

-- 6. Storage policy: anyone can view images
create policy "Public read catalog images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'catalog-images');

-- 7. Storage policy: authenticated users can upload images
create policy "Authenticated upload catalog images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'catalog-images');

-- 8. Storage policy: authenticated users can update (upsert) images
create policy "Authenticated update catalog images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'catalog-images');

-- 9. Seed data
insert into public.catalog_items (product_id, kategori, brand, model, processor, ram, storage, harga, stok, foto_url, image_path, deskripsi)
values
  ('LAP-001', 'Laptop', 'Acer', 'ROG Zephyrus G14', 'AMD Ryzen 9 7940HS', '16GB', '1TB NVMe', 'Rp 26.500.000', 5, 'https://drive.google.com/thumbnail?id=1AX7srz6AbtMb15tgGJ7XXrI2_P4CBStf&sz=w1200', 'products/LAP-001.jpg', 'Laptop gaming ringan dengan performa buas, cocok untuk editing video dan e-sports.'),
  ('LAP-002', 'Laptop', 'Apple', 'MacBook Air M2', 'Apple M2 (8-Core)', '8GB', '256GB SSD', 'Rp 18.000.000', 12, 'https://drive.google.com/thumbnail?id=1QdEcPNBi4Aw68XVOhICfvu0e_kiZeFfa&sz=w1200', 'products/LAP-002.jpg', 'Laptop gaming ringan dengan performa buas, cocok untuk editing video dan e-sports.'),
  ('LAP-003', 'Laptop', 'Lenovo', 'IdeaPad Gaming 3', 'Intel Core i5-12450H', '8GB', '512GB SSD', 'Rp 11.500.000', 8, 'https://drive.google.com/thumbnail?id=1fzav27nbNkPrm3DzfkAXXKtr9BFucmeM&sz=w1200', 'products/LAP-003.jpg', 'Laptop gaming ringan dengan performa buas, cocok untuk editing video dan e-sports.'),
  ('PC-001', 'PC', 'Custom', 'Rakitan Gaming Mid', 'Intel Core i5-13400F', '16GB', '1TB NVMe', 'Rp 14.200.000', 3, 'https://drive.google.com/thumbnail?id=1kSm2TwBa5pgVnvlyNO3vsJWXGTHV2fU2&sz=w1200', 'products/PC-001.jpg', 'Laptop gaming ringan dengan performa buas, cocok untuk editing video dan e-sports.'),
  ('PC-002', 'PC', 'HP', 'Pavilion Desktop', 'AMD Ryzen 5 5600G', '8GB', '512GB SSD', 'Rp 8.500.000', 0, 'https://drive.google.com/thumbnail?id=1PAbmiG1GgrMCo78NJqgz_KgjwBvQnt5Q&sz=w1200', 'products/PC-002.jpg', 'Laptop gaming ringan dengan performa buas, cocok untuk editing video dan e-sports.'),
  ('ACC-001', 'Aksesoris', 'Logitech', 'Mouse MX Master 3S', 'N/A', 'N/A', 'N/A', 'Rp 1.650.000', 25, 'https://drive.google.com/thumbnail?id=1pORqjRSHoo32sxeIKmDJClHI_wORhPgK&sz=w1200', 'products/ACC-001.jpg', ''),
  ('ACC-002', 'Aksesoris', 'Keychron', 'Keyboard K2 V2', 'N/A', 'N/A', 'N/A', 'Rp 1.350.000', 10, 'https://drive.google.com/thumbnail?id=1b8ORUCoXWs9mwxRcZLyXlKgu0-cYorJO&sz=w1200', 'products/ACC-002.jpg', 'Fitur Unggulan:')
on conflict (product_id) do nothing;
