"use client";

import SearchBar from "@/components/SearchBar";
import ResultsDashboard from "@/components/ResultsDashboard";
import UpgradeSimulationPanel from "@/components/UpgradeSimulationPanel";
import ScanLoading from "@/components/ScanLoading";
import { useState } from "react";
import type { ScanResult } from "@/lib/types";

export default function Scanner() {
  const [results, setResults] = useState<ScanResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (url: string) => {
    setSearching(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.status !== 200) {
        setError(data.error || "Scan failed");
        setResults(null);
      } else {
        setResults(data);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Scan failed");
      }
      setResults(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <SearchBar onSearch={handleScan} disabled={searching} />
      {error && (
        <div className="w-full text-sm text-[var(--body-text)] text-destructive text-center">
          {error}
        </div>
      )}
      {searching && <ScanLoading />}
      {!searching && results && (
        <div key={results.scannedAt} className="animate-fade-in-up w-full max-w-5xl">
          <ResultsDashboard result={results} />
        </div>
      )}
      {!searching && results && results.findings.length > 0 && (
        <div className="animate-fade-in-up w-full max-w-5xl mt-6" style={{ animationDelay: "120ms" }}>
          <UpgradeSimulationPanel result={results} />
        </div>
      )}
    </>
  );
}
