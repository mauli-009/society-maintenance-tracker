"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ButtonSpinner } from "@/components/Spinner";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-app flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <Link href="/" className="block text-center mb-8 font-display font-bold text-xl text-accent">
          Society<span className="text-main">Tracker</span>
        </Link>
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-main mb-1">Welcome back</h1>
          <p className="text-sm text-muted mb-6">Sign in to track your complaints.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input-field" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="input-field" />
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <ButtonSpinner /> : "Sign in"}
            </button>
          </div>

          <p className="mt-5 text-sm text-muted text-center">
            New here?{" "}
            <Link href="/register" className="text-accent font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}