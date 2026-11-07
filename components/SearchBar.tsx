"use client";

import { useState } from "react";
import { normalizeUrl } from "@/lib/url";

interface SearchBarProps {
  onSearch: (url: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url.trim());
    if (!normalized) {
      setLocalError("Invalid URL format");
      return;
    }
    setLocalError(null);
    onSearch(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          id="url-input"
          name="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setLocalError(null);
          }}
          placeholder="Enter website URL (e.g. example.com)"
          disabled={disabled}
          className={`flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 text-base ${
            disabled ? "dark:bg-slate-700 dark:text-slate-700 cursor-not-allowed" : ""
          }`}
          aria-label="Website URL"
          required
        />
        <button
          type="submit"
          disabled={disabled || !url.trim()}
          className={`flex-shrink-0 rounded-lg border border-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
            disabled ? "pointer-events-none" : ""
          }`}
        >
          Scan Website
        </button>
      </div>
      {localError && (
        <p className="mt-2 text-sm text-[var(--body-text)] text-destructive text-center">{localError}</p>
      )}
    </form>
  );
}
