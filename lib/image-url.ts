// Pure domain: resolve gambar URL (Q7). Relative imports only (node --test, D4).
// Supabase Storage = canonical (image_path). foto_url = legacy. Placeholder fallback.

const PLACEHOLDER = "https://placehold.co/1200x800?text=No+Photo";

export function getImageUrl(item: {
  image_path?: string | null;
  foto_url?: string | null;
}): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catalog-images/`
    : "";

  if (item.image_path && base) {
    return `${base}${item.image_path}`;
  }
  if (item.foto_url) {
    return item.foto_url;
  }
  return PLACEHOLDER;
}
