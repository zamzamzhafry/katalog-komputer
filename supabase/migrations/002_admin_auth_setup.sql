-- Migration: Admin auth setup
-- This creates a sample admin user via Supabase Auth.
--
-- NOTE: You cannot create auth users via plain SQL insert.
-- Instead, use one of these methods:
--
-- Option A: Supabase Dashboard > Authentication > Users > Add User
--   Email: admin@katalog.local
--   Password: Admin123!
--
-- Option B: Use the Supabase Management API or client signup:
--   const { data, error } = await supabase.auth.admin.createUser({
--     email: 'admin@katalog.local',
--     password: 'Admin123!',
--     email_confirm: true,
--   });
--
-- Option C: Run this via supabase CLI (requires service_role key):
--   curl -X POST 'https://ismsjrxhwtkwsthutuiu.supabase.co/auth/v1/admin/users' \
--     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--     -H "apikey: YOUR_SERVICE_ROLE_KEY" \
--     -H "Content-Type: application/json" \
--     -d '{"email":"admin@katalog.local","password":"Admin123!","email_confirm":true}'

-- RLS policies for authenticated writes are already in 001_create_catalog.sql
-- (grant select, insert, update, delete on public.catalog_items to authenticated)

-- Additional: allow authenticated to delete from storage
create policy "Authenticated delete catalog images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'catalog-images');
