"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Wraps pages that require login. Optionally restrict to a role.
// Usage: <ProtectedRoute role="admin"> ... </ProtectedRoute>
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until auth state is resolved

    if (!user) {
      router.push("/login");
    } else if (role && user.role !== role) {
      // Logged in but wrong role — send them to their correct home
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, loading, role, router]);

  // While checking, or if redirecting, show nothing (or a loader)
  if (loading || !user || (role && user.role !== role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return children;
}