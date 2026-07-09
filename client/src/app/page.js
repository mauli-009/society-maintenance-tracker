"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Society Maintenance Tracker
        </h1>
        <p className="text-gray-600 mb-8">
          Raise complaints, track their progress, and stay informed with
          notices — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}