"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/supabase/auth";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    setEmail("");
    setPassword("");
    const raw = params.get("redirect") || "/dashboard";
    // Validasi redirect: harus path relatif, bukan //evil.com atau https://...
    const safe = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
    router.push(safe);
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1 className="login-title">Admin Login</h1>
      <p className="login-sub">Masuk untuk kelola katalog.</p>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          placeholder="admin@admin.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
          autoComplete="email"
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
          autoComplete="current-password"
        />
      </label>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="primary login-submit" type="submit" disabled={loading}>
        {loading ? "Memuat..." : "Masuk"}
      </button>
      <a className="login-back" href="/">
        ← Kembali ke katalog
      </a>
    </form>
  );
}
