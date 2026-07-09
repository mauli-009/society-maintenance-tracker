"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { ButtonSpinner } from "@/components/Spinner";
import api from "@/lib/api";

const CATEGORIES = ["Plumbing", "Electrical", "Cleaning", "Security", "Elevator", "Other"];

function NewComplaintContent() {
  const router = useRouter();
  const [category, setCategory] = useState("Plumbing");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!description.trim()) return setError("Please enter a description");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description);
      if (photo) formData.append("photo", photo);
      await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to raise complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 py-8 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-main mb-1">Raise a complaint</h1>
        <p className="text-sm text-muted mb-6">Describe the issue and add a photo if you can.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-main mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-main mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the issue in detail..." className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-main mb-1.5">Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange}
              className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white file:cursor-pointer hover:file:opacity-90" />
            {preview && <img src={preview} alt="Preview" className="mt-3 h-40 rounded-lg object-cover border border-app" />}
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <ButtonSpinner /> : "Submit complaint"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function NewComplaintPage() {
  return (
    <ProtectedRoute role="resident">
      <NewComplaintContent />
    </ProtectedRoute>
  );
}