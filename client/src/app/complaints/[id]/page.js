"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/Badges";
import { PageLoader } from "@/components/Spinner";
import api from "@/lib/api";

function DetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(({ data }) => setComplaint(data.complaint))
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
        <button onClick={() => router.back()} className="text-sm text-muted hover:text-main mb-4">← Back</button>

        {loading ? <PageLoader /> : error ? (
          <div className="card p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            <div className="card p-6 mb-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="font-display text-2xl font-bold text-main">{complaint.category}</h1>
                    {complaint.isOverdue && <OverdueBadge />}
                  </div>
                  <p className="text-muted">{complaint.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
              {complaint.photoUrl && (
                <img src={complaint.photoUrl} alt="Complaint" className="w-full max-h-80 object-contain rounded-lg border border-app mb-3 bg-app" />
              )}
              <p className="text-xs text-muted opacity-70">Raised on {new Date(complaint.createdAt).toLocaleString()}</p>
            </div>

            <div className="card p-6">
              <h2 className="font-display font-semibold text-main mb-4">Status history</h2>
              <div className="space-y-1">
                {complaint.statusHistory.map((entry, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent mt-1.5" />
                      {idx < complaint.statusHistory.length - 1 && <div className="w-0.5 flex-1 bg-app my-1" style={{ background: "var(--border)" }} />}
                    </div>
                    <div className="pb-5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={entry.status} />
                        <span className="text-xs text-muted opacity-70">{new Date(entry.changedAt).toLocaleString()}</span>
                      </div>
                      {entry.note && <p className="text-sm text-muted mt-1.5">{entry.note}</p>}
                      {entry.changedBy?.name && (
                        <p className="text-xs text-muted opacity-70 mt-1">by {entry.changedBy.name} · {entry.changedBy.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ComplaintDetailPage() {
  return (
    <ProtectedRoute>
      <DetailContent />
    </ProtectedRoute>
  );
}