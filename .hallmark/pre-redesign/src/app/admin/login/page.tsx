"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Invalid password");
      return;
    }

    setSuccess(true);
    // Redirect to dashboard - cookie will be checked by middleware on next request
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-8 md:p-16">
      {success ? (
        <div className="text-center mb-8">
          <p className="text-2xl text-success">Login successful!</p>
          <p className="mt-2">Redirecting to dashboard…</p>
        </div>
      ) : (
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-3xl font-bold">Admin Login</h2>

          {error && (
            <div className="bg-primary-50 border-l-4 border-primary-700 text-primary-800 p-4 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Admin Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary-700 text-white rounded-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}