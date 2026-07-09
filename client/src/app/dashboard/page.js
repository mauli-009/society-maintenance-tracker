"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/Badges";
import { PageLoader } from "@/components/Spinner";
import api from "@/lib/api";

function DashboardContent() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/complaints/my")
      .then(({ data }) => setComplaints(data.complaints))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-main">My Complaints</h1>
            <p className="text-sm text-muted mt-0.5">Track every issue you&apos;ve raised.</p>
          </div>
          <Link href="/complaints/new" className="btn-primary text-sm">+ Raise Complaint</Link>
        </div>

        {loading ? (
          <PageLoader />
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-muted mb-4">You haven&apos;t raised any complaints yet.</p>
            <Link href="/complaints/new" className="text-accent font-medium hover:underline">Raise your first one →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <Link key={c._id} href={`/complaints/${c._id}`} className="card p-5 block hover:border-accent">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-main">{c.category}</span>
                      {c.isOverdue && <OverdueBadge />}
                    </div>
                    <p className="text-sm text-muted line-clamp-2">{c.description}</p>
                    <p className="text-xs text-muted mt-2 opacity-70">
                      Raised {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute role="resident">
      <DashboardContent />
    </ProtectedRoute>
  );
}