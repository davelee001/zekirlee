"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("zekirlee.theme", dark ? "dark" : "light"); } catch { /* The theme still works when storage is unavailable. */ }
  }

  return (
    <button className="icon-button theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle light or dark theme" title="Toggle light or dark theme">
      <Moon size={19} className="theme-moon" aria-hidden="true" />
      <Sun size={19} className="theme-sun" aria-hidden="true" />
    </button>
  );
}
