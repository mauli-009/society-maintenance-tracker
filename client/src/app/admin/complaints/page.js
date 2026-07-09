"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/Badges";
import { PageLoader } from "@/components/Spinner";
import api from "@/lib/api";

const CATEGORIES = ["", "Plumbing", "Electrical", "Cleaning", "Security", "Elevator", "Other"];
const STATUSES = ["", "Open", "In Progress", "Resolved"];
const PRIORITIES = ["Low", "Medium", "High"];

function AdminComplaintsContent() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [expanded, setExpanded] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.status) params.append("status", filters.status);
    const { data } = await api.get(`/complaints?${params.toString()}`);
    setComplaints(data.complaints);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const changePriority = async (id, priority) => {
    await api.patch(`/complaints/${id}/priority`, { priority });
    fetchComplaints();
  };

  const changeStatus = async (id, status, note) => {
    await api.patch(`/complaints/${id}/status`, { status, note });
    setExpanded(null);
    fetchComplaints();
  };

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-main mb-1">
          All Complaints
        </h1>
        <p className="text-sm text-muted mb-6">
          Overdue complaints surface at the top.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input-field w-auto"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c || "All categories"}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s || "All statuses"}
              </option>
            ))}
          </select>
          {(filters.category || filters.status) && (
            <button
              onClick={() => setFilters({ category: "", status: "" })}
              className="px-3 py-2 text-sm text-muted hover:text-main"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <PageLoader />
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center text-muted">
            No complaints match these filters.
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="card p-5"
                style={c.isOverdue ? { borderColor: "var(--accent)" } : {}}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-main">{c.category}</span>
                      {c.isOverdue && <OverdueBadge />}
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-sm text-muted">{c.description}</p>
                    <p className="text-xs text-muted opacity-70 mt-2">
                      {c.resident?.name} · {c.resident?.flatNumber} ·{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                 {c.photoUrl && (
                      <a href={c.photoUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline mt-1 inline-block">View photo →</a>
                    )}
                    
                  </div>
                </div>

                {/* Controls (hidden once closed) */}
                {!c.isClosed && (
                  <div
                    className="mt-4 pt-4 flex flex-wrap items-center gap-3 border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {/* Priority */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">Priority:</span>
                      <select
                        value={c.priority}
                        onChange={(e) => changePriority(c._id, e.target.value)}
                        className="input-field w-auto py-1 text-sm"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status update trigger */}
                    <button
                      onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                      className="btn-primary text-sm py-1.5"
                    >
                      Update status
                    </button>
                  </div>
                )}

                {c.isClosed && (
                  <p className="mt-3 text-xs text-emerald-600 font-medium">
                    ✓ Resolved &amp; closed
                  </p>
                )}

                {/* Status update panel */}
                {expanded === c._id && (
                  <StatusUpdatePanel
                    onSubmit={(status, note) => changeStatus(c._id, status, note)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusUpdatePanel({ onSubmit }) {
  const [status, setStatus] = useState("In Progress");
  const [note, setNote] = useState("");

  return (
    <div className="mt-4 p-4 rounded-lg space-y-3" style={{ background: "var(--bg)" }}>
      <div className="flex flex-wrap gap-2">
        {["Open", "In Progress", "Resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className="px-3 py-1.5 text-sm rounded-lg transition"
            style={
              status === s
                ? { background: "var(--accent)", color: "#fff" }
                : {
                    background: "var(--surface)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            {s}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Add a note (optional)..."
        className="input-field resize-none text-sm"
      />
      <button onClick={() => onSubmit(status, note)} className="btn-primary text-sm py-1.5">
        Save update
      </button>
    </div>
  );
}

export default function AdminComplaintsPage() {
  return (
    <ProtectedRoute role="admin">
      <AdminComplaintsContent />
    </ProtectedRoute>
  );
}