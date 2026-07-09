"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-lg hover:bg-surface transition text-main"
      title={theme === "light" ? "Switch to dark" : "Switch to light"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}