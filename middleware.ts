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
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect /dashboard: butuh session. Else redirect /login.
  const path = req.nextUrl.pathname;
  if (path.startsWith("/dashboard") && !session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }
  // Sudah login + buka /login -> redirect /dashboard (hindari double-login).
  if (path === "/login" && session) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
