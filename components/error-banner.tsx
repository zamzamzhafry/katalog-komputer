"use client";

/**
 * Q13: banner runtime error.
 * - runtime error + ada cache -> "data cache (mungkin tidak terbaru)"
 * - runtime error + tanpa cache -> "Gagal memuat, coba refresh"
 */
export function ErrorBanner({
  show,
  hasCache,
}: {
  show: boolean;
  hasCache: boolean;
}) {
  if (!show) return null;
  return (
    <div className="error-banner" role="alert">
      {hasCache
        ? "Gagal memuat data terbaru. Menampilkan data cache (mungkin tidak terbaru)."
        : "Gagal memuat katalog. Coba refresh halaman."}
    </div>
  );
}
