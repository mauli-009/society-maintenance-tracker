"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const { user } = useAuth();
  const homeHref = user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/";

  return (
    <main className="min-h-screen bg-app">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href={homeHref} className="font-display text-lg font-bold text-accent">
          Society<span className="text-main">Tracker</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/dashboard"}
              className="btn-primary text-sm"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-muted hover:text-main transition">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium text-accent rounded-full" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          For residents &amp; society admins
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-main tracking-tight leading-[1.05]">
          Every complaint,
          <br />
          <span className="text-accent">tracked to resolution.</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-xl mx-auto">
          Raise maintenance issues with photos, follow their progress in real time,
          and never miss an important society notice again.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={user ? homeHref : "/register"} className="btn-primary">
            {user ? "Go to dashboard" : "Create an account"}
          </Link>
          {!user && (
            <Link href="/login" className="px-6 py-3 rounded-lg font-medium text-main transition" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              I already have one
            </Link>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { title: "Raise with proof", body: "Attach a photo so the admin sees the issue exactly as you do." },
          { title: "Full status history", body: "Every update is timestamped and logged — no more guessing." },
          { title: "Notices that reach you", body: "Important announcements land in your inbox, pinned to the board." },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <h3 className="font-display font-semibold text-main mb-2">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}