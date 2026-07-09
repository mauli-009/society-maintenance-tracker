"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { PageLoader } from "@/components/Spinner";
import api from "@/lib/api";

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted mb-1">{label}</p>
      <p
        className="font-display text-3xl font-bold"
        style={{ color: accent ? "var(--accent)" : "var(--text)" }}
      >
        {value}
      </p>
    </div>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/complaints/stats/dashboard")
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-main">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Overview of all society complaints.
            </p>
          </div>
          <Link href="/admin/complaints" className="btn-primary text-sm">
            Manage complaints
          </Link>
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Top-level counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total complaints" value={stats.totalComplaints} />
              <StatCard label="Open" value={stats.byStatus?.Open || 0} />
              <StatCard
                label="In Progress"
                value={stats.byStatus?.["In Progress"] || 0}
              />
              <StatCard
                label="Overdue"
                value={stats.overdueCount}
                accent
              />
            </div>

            {/* By status */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-main mb-4">
                  By Status
                </h2>
                <div className="space-y-3">
                  {["Open", "In Progress", "Resolved"].map((s) => {
                    const count = stats.byStatus?.[s] || 0;
                    const pct = stats.totalComplaints
                      ? (count / stats.totalComplaints) * 100
                      : 0;
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted">{s}</span>
                          <span className="text-main font-medium">{count}</span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: "var(--bg)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: "var(--accent)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By category */}
              <div className="card p-6">
                <h2 className="font-display font-semibold text-main mb-4">
                  By Category
                </h2>
                <div className="space-y-2">
                  {Object.entries(stats.byCategory || {}).length === 0 ? (
                    <p className="text-sm text-muted">No data yet.</p>
                  ) : (
                    Object.entries(stats.byCategory).map(([cat, count]) => (
                      <div
                        key={cat}
                        className="flex justify-between items-center py-1.5 border-b last:border-0"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="text-sm text-muted">{cat}</span>
                        <span className="text-sm font-medium text-main">
                          {count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute role="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}