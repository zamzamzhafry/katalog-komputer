-- Migration 004: RLS write policies untuk catalog_items.
-- Bug: migration 001 hanya buat SELECT policy + GRANT, tapi RLS enable -> GRANT tidak cukup.
-- Saat RLS enable, butuh explicit INSERT/UPDATE/DELETE policy, else default deny.
-- Effect: Server Action mutasi (save/delete/upload) 403 untuk authenticated admin.

-- INSERT: authenticated boleh tambah item baru.
create policy "Authenticated insert catalog"
  on public.catalog_items
  for insert
  to authenticated
  with check (true);

-- UPDATE: authenticated boleh ubah item.
create policy "Authenticated update catalog"
  on public.catalog_items
  for update
  to authenticated
  using (true)
  with check (true);

-- DELETE: authenticated boleh hapus item.
create policy "Authenticated delete catalog"
  on public.catalog_items
  for delete
  to authenticated
  using (true);

-- ponytail: kalau Q3 role (admin/editor) jalan, restrict policy pakai
-- (auth.jwt() ->> 'role') = 'admin'. Saat ini authenticated = full (admin tunggal).
