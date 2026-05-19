"use client";

import { useState } from "react";
import { signIn, signOut } from "@/lib/supabase/auth";
import type { User } from "@supabase/supabase-js";

interface LoginPanelProps {
  user: User | null;
  onAuthChange: () => void;
}

export function LoginPanel({ user, onAuthChange }: LoginPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
    } else {
      setEmail("");
      setPassword("");
      onAuthChange();
    }
    setLoading(false);
  }

  async function handleLogout() {
    setLoading(true);
    await signOut();
    onAuthChange();
    setLoading(false);
  }

  if (user) {
    return (
      <div className="login-panel logged-in">
        <span className="admin-badge">Admin: {user.email}</span>
        <button className="ghost" onClick={handleLogout} disabled={loading} type="button">
          Logout
        </button>
      </div>
    );
  }

  return (
    <form className="login-panel" onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email admin"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="login-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="login-input"
      />
      <button className="primary" type="submit" disabled={loading}>
        {loading ? "..." : "Login"}
      </button>
      {error && <span className="login-error">{error}</span>}
    </form>
  );
}
