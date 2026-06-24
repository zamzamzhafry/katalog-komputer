import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase server client (cookie-based, RLS-enforced). Q9/Q16-C.
 * Pakai session cookie user -> RLS lihat `authenticated` -> writes pass (D1, no service_role).
 * Next 14.2: cookies() sync (async in 15). Jangan await.
 */
export function createServerClient() {
  const store = cookies();
  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // Dipanggil dari Server Component -> tidak bisa set cookie (read-only context).
            // Middleware yang handle refresh. Abaikan di sini.
          }
        },
      },
    },
  );
}
