import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Refresh Supabase session cookie tiap request (Q9). Standard @supabase/ssr pattern.
 * Tanpa ini, session cookie bisa expired diam-diam -> writes RLS reject (D1).
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }) => {
            // Set di request supaya downstream baca cookie baru; set di response supaya browser persist.
            req.cookies.set({ name, value, ...options });
            res.cookies.set({ name, value, ...options });
          });
        },
      },
    },
  );

  // Refresh session. Jangan pakai getUser() supaya tidak extend session di edge (lebih simple: getSession refresh cookie).
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
