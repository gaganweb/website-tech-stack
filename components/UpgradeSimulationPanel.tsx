"use client";

import { useState } from "react";
import type { ScanResult, Finding } from "@/lib/types";
import { computePerformanceScore, computeSeoScore, computeSecurityScore, computeUpliftBenchmark } from "@/components/ResultsDashboard";

interface GaugeRingProps {
  label: string;
  value: number; // 0..100 (completion %)
  color: string;
  hint?: string;
}

function GaugeRing({ label, value, color, hint }: GaugeRingProps) {
  const radius = 36;
  const stroke = 7;
  return (
    <div className="glass flex flex-col items-center gap-3 p-5 rounded-2xl text-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}>
          <circle cx={40} cy={40} r={radius} fill="none" stroke="var(--card-border)" strokeWidth={stroke} />
          <circle
            cx={40}
            cy={40}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${(2 * Math.PI * radius * value) / 100} ${Math.PI * radius * 2}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray .5s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-bold tracking-tighter" style={{ color }}>
          {Math.round(value)}%
        </span>
      </div>
      <div>
        <div className="text-sm font-bold uppercase tracking-wide whitespace-nowrap" style={{ color }}>
          {label}
        </div>
        {hint && <p className="text-sm text-[var(--body-text)] mt-1 leading-relaxed">{hint}</p>}
      </div>
    </div>
  );
}

function SectionItem({ title, description, value, color }: { title: string; description: string; value: number; color: string }) {
  return (
    <GaugeRing label={title} value={value} color={color} hint={description} />
  );
}

export default function UpgradeSimulationPanel({ result }: { result?: ScanResult }) {
  const [expanded, setExpanded] = useState(false);

  if (!result || result.findings.length === 0) return null;

  const cardsByCategory = new Map<string, Finding[]>();
  for (const f of result.findings) {
    const arr = cardsByCategory.get(f.category) ?? [];
    arr.push(f);
    cardsByCategory.set(f.category, arr);
  }

  const hasMonolithHint = [...cardsByCategory.values()].some((list) =>
    list.some((f) => f.category === "CMS")
  );


  return (
    <div className="glass relative isolate overflow-hidden w-full max-w-5xl box-border rounded-xl p-6">
      {/* Ambient color behind the glass so the blur has something to diffuse. */}
      <div aria-hidden className="pointer-events-none absolute -z-10 -top-24 -left-16 h-72 w-72 rounded-full blur-3xl" style={{ background: "var(--glass-glow-a)" }} />
      <div aria-hidden className="pointer-events-none absolute -z-10 -bottom-24 -right-16 h-72 w-72 rounded-full blur-3xl" style={{ background: "var(--glass-glow-b)" }} />
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="glass-accent inline-flex w-full items-center justify-between gap-3 px-5 py-3.5 rounded-xl text-[var(--heading-text)] text-lg font-bold tracking-tight hover:brightness-110 transition duration-150"
        aria-pressed={expanded}
        aria-expanded={expanded}
      >
        <span>🚀 Simulate Next.js Performance Upgrade</span>
        <span className="text-sm font-semibold text-[var(--primary)]">{expanded ? "Hide" : "Show"} benefits</span>
      </button>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted-text)]">
        Contrasts the scanned architecture against a modern React/Next.js solution.
      </p>

      {expanded && (
        <>
          {/* Side-by-side comparison layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 mb-3">
            <div className="glass rounded-xl p-4 text-sm">
              <div className="text-base font-bold text-[var(--heading-text)]">Detected now (actual scan)</div>
              <ul className="text-[var(--muted-text)] mt-2 space-y-1">
                {[...cardsByCategory.entries()]
                  .filter(([, list]) => list.length > 0)
                    .sort(([a], [b]) => CATEGORY_ORDER_INDEX[a] - CATEGORY_ORDER_INDEX[b])
                      .map(([cat, list]) => (
                        <li key={cat} className="text-[var(--muted-text)]">
                          <strong className="text-[var(--body-text)]">{cat}:</strong>{" "}
                          {list.map((f) => f.name).join(", ") || "none detected"}
                        </li>
                      ))}
                {!hasMonolithHint && (
                  <li className="text-[var(--muted-text)]">No monolithic CMS badge present.</li>
                )}
              </ul>
            </div>
            <div className="glass-accent rounded-xl p-4 text-sm">
              <div className="text-base font-bold text-[var(--primary)]">Proposed stack</div>
              <div className="text-[var(--heading-text)] font-semibold mt-2">
                Next.js (App Router) · React Server Components · Edge Network · Cloudflare
              </div>
              <div className="text-[var(--muted-text)] mt-2 leading-relaxed">
                Server-side rendering replaces TTI-dragging CSR bundles; Edge caching reduces first paint latency; modular component routes replace monolithic plugin installs.
              </div>
            </div>
          </div>

          {/* Illustrative migration potential — fixed benchmark, NOT derived from this scan. */}
          <div className="glass-accent rounded-2xl p-6 mb-4 text-center">
            <span className="inline-block rounded-full border border-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              Estimated Architectural Benchmark · Simulated Projections
            </span>
            <div className="mt-4 font-mono text-7xl sm:text-8xl font-extrabold tracking-tighter bg-gradient-to-br from-[var(--primary)] via-cyan-500 to-fuchsia-500 bg-clip-text text-transparent">
              {computeUpliftBenchmark(result)}%
            </div>
            <div className="mt-2 text-xl font-bold text-[var(--heading-text)]">
              Architectural uplift potential
            </div>
            <p className="mt-3 mx-auto max-w-md text-sm leading-relaxed text-[var(--muted-text)]">
              Typical range of 92–98% for legacy sites rebuilt on Next.js with React Server Components,
              optimized rendering and edge caching. Actual gains depend on the site and must be measured
              after migration.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <SectionItem title="Performance" description="Server Components ship less JS; edge caching cuts time to first byte" value={UPLIFT_BENCHMARK.performance} color={PERF_COLOR} />
            <SectionItem title="SEO & Metadata" description="Server-rendered HTML and per-route metadata crawlers can read" value={UPLIFT_BENCHMARK.seo} color={SEO_COLOR} />
            <SectionItem title="Security & Architecture" description="Modular components replace plugin-heavy monoliths; smaller attack surface" value={UPLIFT_BENCHMARK.security} color={SECURITY_COLOR} />
          </div>

          {/* Current = this site's scan score; Projected = fixed benchmark above. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {[
              { label: "Performance", now: computePerformanceScore(result), next: UPLIFT_BENCHMARK.performance, color: PERF_COLOR },
              { label: "SEO & Metadata", now: computeSeoScore(result), next: UPLIFT_BENCHMARK.seo, color: SEO_COLOR },
              { label: "Security & Architecture", now: computeSecurityScore(result), next: UPLIFT_BENCHMARK.security, color: SECURITY_COLOR },
            ].map(({ label, now, next, color }) => (
              <div key={label} className="glass min-w-0 overflow-hidden rounded-xl p-4">
                <div className="text-sm font-bold uppercase tracking-wide break-words" style={{ color }}>{label}</div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 min-w-0">
                  <div className="text-center min-w-0 shrink">
                    <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[var(--muted-text)]">{now}%</div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)] truncate">Current</div>
                  </div>
                  <div className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 font-mono text-base font-extrabold text-white ring-1 ring-white/30" style={{ backgroundColor: color, boxShadow: `0 0 18px ${color}aa` }}>
                    {next - now >= 0 ? "+" : ""}{next - now}
                  </div>
                  <div className="text-center min-w-0 shrink">
                    <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color }}>{next}%</div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)] truncate">Projected</div>
                  </div>
                </div>
                <div className="relative mt-3 h-2 rounded-full bg-[var(--card-border)]">
                  <div className="absolute inset-y-0 left-0 rounded-full opacity-50" style={{ width: `${next}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                  <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--muted-text)]" style={{ width: `${now}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Fixed illustrative per-category figures for client demos. Not computed from scan data.
const UPLIFT_BENCHMARK = { performance: 97, seo: 96, security: 95 }; // overall comes from computeUpliftBenchmark
const PERF_COLOR = "#22c55e"; // bright green
const SEO_COLOR = "#a855f7"; // vivid violet
const SECURITY_COLOR = "#06b6d4"; // bright cyan

const CATEGORY_ORDER_INDEX: Record<string, number> = {
  CMS: 0,
  Hosting: 1,
  Analytics: 2,
  Framework: 3,
};
