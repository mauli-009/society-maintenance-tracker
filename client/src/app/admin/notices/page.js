"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { ButtonSpinner } from "@/components/Spinner";
import api from "@/lib/api";

function AdminNoticesContent() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", isImportant: false });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const fetchNotices = () =>
    api.get("/notices").then(({ data }) => setNotices(data.notices));

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePost = async () => {
    setError("");
    if (!form.title.trim() || !form.content.trim()) {
      return setError("Title and content are required");
    }
    setPosting(true);
    try {
      await api.post("/notices", form);
      setForm({ title: "", content: "", isImportant: false });
      fetchNotices();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/notices/${id}`);
    fetchNotices();
  };

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-main mb-6">
          Notice Board
        </h1>

        {/* Post form */}
        <div className="card p-6 mb-8">
          <h2 className="font-display font-semibold text-main mb-4">
            Post a notice
          </h2>
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
            />
            <textarea
              placeholder="Write the announcement..."
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-field resize-none"
            />
            <label className="flex items-center gap-2 text-sm text-main cursor-pointer">
              <input
                type="checkbox"
                checked={form.isImportant}
                onChange={(e) => setForm({ ...form, isImportant: e.target.checked })}
                className="w-4 h-4 accent-amber-600"
              />
              Mark as important (pins to top &amp; emails all residents)
            </label>
            <button
              onClick={handlePost}
              disabled={posting}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {posting ? <ButtonSpinner /> : "Post notice"}
            </button>
          </div>
        </div>

        {/* Existing notices */}
        <div className="space-y-3">
          {notices.map((n) => (
            <div
              key={n._id}
              className="card p-5"
              style={n.isImportant ? { borderColor: "var(--accent)" } : {}}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {n.isImportant && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-white">
                        📌 Important
                      </span>
                    )}
                    <h3 className="font-semibold text-main">{n.title}</h3>
                  </div>
                  <p className="text-sm text-muted whitespace-pre-line">
                    {n.content}
                  </p>
                  <p className="text-xs text-muted opacity-70 mt-2">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(n._id)}
                  className="text-sm text-red-500 hover:bg-red-500/10 px-2 py-1 rounded-lg shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function AdminNoticesPage() {
  return (
    <ProtectedRoute role="admin">
      <AdminNoticesContent />
    </ProtectedRoute>
  );
}