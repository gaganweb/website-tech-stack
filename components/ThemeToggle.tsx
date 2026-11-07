"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // The inline script in app/layout.tsx already applied the saved theme; just sync to it.
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    setIsDark(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // storage blocked: theme still switches for this page view
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle dark mode"
        className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium"
      >
        <div className="h-4 w-4" />
        <span className="text-xs font-semibold">Theme</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:opacity-80"
    >
      {isDark ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <span className="text-xs font-bold tracking-wide uppercase text-[var(--heading-text)]">
            Light
          </span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span className="text-xs font-bold tracking-wide uppercase text-[var(--heading-text)]">
            Dark
          </span>
        </>
      )}
    </button>
  );
}