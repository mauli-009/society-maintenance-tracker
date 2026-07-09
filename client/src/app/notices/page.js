"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { PageLoader } from "@/components/Spinner";
import api from "@/lib/api";

function NoticesContent() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notices")
      .then(({ data }) => setNotices(data.notices))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-main mb-1">Notice Board</h1>
        <p className="text-sm text-muted mb-6">Announcements from your society admin.</p>

        {loading ? <PageLoader /> : notices.length === 0 ? (
          <div className="card p-12 text-center text-muted">No notices yet.</div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n._id} className={`card p-5 ${n.isImportant ? "border-accent" : ""}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {n.isImportant && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-white">📌 Important</span>
                  )}
                  <h3 className="font-semibold text-main">{n.title}</h3>
                </div>
                <p className="text-sm text-muted whitespace-pre-line">{n.content}</p>
                <p className="text-xs text-muted opacity-70 mt-3">
                  {new Date(n.createdAt).toLocaleDateString()}
                  {n.postedBy?.name && ` · ${n.postedBy.name}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function NoticesPage() {
  return (
    <ProtectedRoute>
      <NoticesContent />
    </ProtectedRoute>
  );
}