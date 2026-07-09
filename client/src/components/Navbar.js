"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links =
    user.role === "admin"
      ? [
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/complaints", label: "Complaints" },
          { href: "/admin/notices", label: "Notices" },
        ]
      : [
          { href: "/dashboard", label: "My Complaints" },
          { href: "/complaints/new", label: "Raise Complaint" },
          { href: "/notices", label: "Notices" },
        ];

  const homeHref = user.role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo → landing page */}
        <Link href="/" className="font-display text-lg font-bold text-accent shrink-0">
          Society<span className="text-main">Tracker</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="px-3.5 py-2 text-sm font-medium rounded-lg transition"
                style={
                  active
                    ? { background: "var(--accent)", color: "#fff" }
                    : { color: "var(--text-muted)" }
                }
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right cluster: toggle, user chip, logout */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          <div
            className="hidden sm:flex items-center gap-2 pl-2 pr-1 py-1 rounded-full"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm text-main pr-1">{user.name}</span>
          </div>

          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition text-red-500 hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile links row */}
      <div
        className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto border-t"
        style={{ borderColor: "var(--border)" }}
      >
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition"
              style={
                active
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--text-muted)" }
              }
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}