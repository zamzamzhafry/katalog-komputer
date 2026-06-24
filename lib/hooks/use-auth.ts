"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getUser, signIn, signOut } from "@/lib/supabase/auth";

/**
 * Auth hook (Q14). Cek session cookie via browser client (login interactive).
 * Server client (RSC/Server Action) baca cookie yang sama (D1).
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = useCallback(async () => {
    const { user: currentUser } = await getUser();
    setUser(currentUser ?? null);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await signIn(email, password);
      if (!error) {
        await checkAuth();
      }
      return { error };
    },
    [checkAuth],
  );

  const logout = useCallback(async () => {
    await signOut();
    await checkAuth();
  }, [checkAuth]);

  return { user, checkAuth, login, logout };
}
