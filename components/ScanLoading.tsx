"use client";

import { useEffect, useState } from "react";

// The steps the scan really performs (lib/analyzer.ts + lib/infra.ts), shown in order.
const STEPS = [
  "Fetching page & response headers",
  "Analyzing hosting infrastructure",
  "Resolving DNS & nameservers",
  "Inspecting SSL certificate",
  "Evaluating tech stack",
];

export default function ScanLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Advance through the steps and stay on the last one until the scan returns.
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in-up w-full max-w-5xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 rounded-xl shadow-md"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--primary)]" />
        </span>
        <p key={step} className="animate-fade-in-up font-mono text-sm font-semibold text-[var(--heading-text)]">
          {STEPS[step]}
          <span className="loading-dots" aria-hidden>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>

      {/* Skeleton mirrors the results layout: three score cards, then finding cards. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--card-border)] p-4">
            <div className="skeleton h-16 w-16 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-lg border border-[var(--card-border)] p-4">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-[var(--card-border)]" aria-hidden>
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-700 ease-out"
          style={{ width: `${((step + 1) / STEPS.length) * 90}%` }}
        />
      </div>
    </div>
  );
}
