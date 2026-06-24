import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Login Admin — Katalog Komputer" };

export default function LoginPage() {
  return (
    <main className="login-shell">
      <Suspense fallback={<div className="login-form">Memuat...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
