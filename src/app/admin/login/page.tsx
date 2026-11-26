"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function AdminLoginPage() {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(response.status === 401 ? "Contraseña incorrecta." : data.error || "No se pudo iniciar sesión.");
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center py-12">
      <Card as="section" className="w-full max-w-md">
        <h1 className="text-display-s text-ink">Panel del festejo</h1>
        <p className="mt-2 text-ink-2">Ingresá la contraseña de administración.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-input border border-rule bg-surface px-4 text-base text-ink shadow-sm"
            />
          </div>

          <p role="alert" className="min-h-[1lh] text-sm font-medium text-spot-deep">
            {error}
          </p>

          <Button type="submit" fullWidth loading={submitting}>
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
}
