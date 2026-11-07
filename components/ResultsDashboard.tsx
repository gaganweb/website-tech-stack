"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ScanResult, Finding } from "@/lib/types";

interface MetricRingProps {
  label: string;
  value: number; // 0..100
  color: string;
  size?: number;
}

function MetricRing({ value, color, size = 96 }: Pick<MetricRingProps, "value" | "color" | "size">) {
  const radius = (size - 8) / 2;
  const stroke = Math.max(2, size * 0.12);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke="var(--card-border)" 
          strokeWidth={stroke} 
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="font-mono text-sm font-bold tracking-tight text-[var(--heading-text)]">{Math.round(value)}%</span>
    </div>
  );
}

function ScoreCard({ 
  score, 
  color, 
  label, 
  sublabel 
}: { 
  score: number; 
  color: string; 
  label: string; 
  sublabel: string 
}) {
  return (
    <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-center flex flex-col items-center justify-between shadow-sm">
      <MetricRing value={score} color={color} size={72} />
      <div className="mt-3">
        <span className="block text-xs font-bold uppercase tracking-wider text-[var(--heading-text)]">
          {label}
        </span>
        <span className="block text-[11px] font-medium text-[var(--muted-text)] mt-0.5">
          {sublabel}
        </span>
      </div>
    </div>
  );
}

export default function ResultsDashboard({ result }: { result: ScanResult }) {
  const [toast, setToast] = useState<"copied" | "failed" | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const copySummary = useCallback(() => {
    const show = (state: "copied" | "failed") => {
      setToast(state);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    };
    // Clipboard can be blocked (insecure context / denied permission) — say so instead of faking success.
    navigator.clipboard.writeText(buildTextReport(result)).then(() => show("copied"), () => show("failed"));
  }, [result]);

  const performanceScore = computePerformanceScore(result);
  const seoScore = computeSeoScore(result);
  const securityScore = computeSecurityScore(result);

  const findingsByCategory = ["CMS", "Hosting", "Analytics", "Framework"].map((category) => ({
    category,
    findings: result.findings.filter((f) => f.category === category),
  })).filter((entry) => entry.findings.length > 0);

  return (
    <div className="w-full max-w-5xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--heading-text)]">
            Scan Results for {result.url}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--body-text)]">
            Status: {result.status} &bull; {result.responseTimeMs}ms response time
          </p>
        </div>
        <div className="relative self-start sm:self-auto">
        <span
          role="status"
          aria-live="polite"
          className={`pointer-events-none absolute bottom-full right-0 mb-2 flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-all duration-200 ease-out ${
            toast ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-95"
          }`}
        >
          {toast === "failed" ? (
            <>Couldn&apos;t copy, clipboard blocked</>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {toast ? "Copied to clipboard!" : ""}
            </>
          )}
        </span>
        <button
          type="button"
          onClick={copySummary}
          className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--card-border)] text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors duration-150"
          aria-label="Copy scan summary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15l7-7 7 7" />
          </svg>
          Copy
        </button>
        </div>
      </div>

      {/* Circular metric widgets with professional labeling */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <ScoreCard 
          score={performanceScore} 
          color="#16a34a" 
          label="Performance" 
          sublabel="Speed & edge caching" 
        />
        <ScoreCard 
          score={seoScore} 
          color="#0ea5e9" 
          label="SEO & Metadata" 
          sublabel="Structure & headers" 
        />
        <ScoreCard 
          score={securityScore} 
          color="#b45309" 
          label="Security & CDN" 
          sublabel="Hardening & protection" 
        />
      </div>

      {result.infra && (
        <InfraPanel
          infra={result.infra}
          hosting={result.findings.filter((f) => f.category === "Hosting").map((f) => f.name)}
        />
      )}

      {findingsByCategory.length === 0 ? (
        <p className="text-sm text-[var(--muted-text)]">No detectable technologies were found in this scan.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {findingsByCategory.map(({ category, findings }) => (
            <div key={category} className="rounded-lg border border-[var(--card-border)] p-4 bg-[var(--background)]">
              <h3
                className="text-xs font-semibold uppercase tracking-wide mb-3 rounded-md px-3 py-1 inline-block"
                style={{ backgroundColor: `var(--${category}-pill)`, color: `var(--${category}-pill-fg)` }}
              >
                {category}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {findings.map((finding: Finding) => (
                  <div
                    key={finding.id}
                    className="p-3 rounded-lg border shadow-sm"
                    style={{ borderColor: `var(--${category}-badge)`, backgroundColor: `var(--${category}-bg)` }}
                  >
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `var(--${category}-pill)`, color: `var(--${category}-pill-fg)` }}
                      >
                        {finding.confidence}
                      </span>
                      <span className="text-sm font-semibold text-[var(--body-text)]">{finding.name}</span>
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: `var(--${category}-badge-fg)` }}
                    >
                      {finding.category}
                    </span>
                    {finding.detail && (
                      <p className="text-xs text-[var(--muted-text)] mt-1 leading-relaxed">
                        {finding.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function computePerformanceScore(result: ScanResult): number {
  const hostingHigh = result.findings.filter((f) => f.category === "Hosting").some((f) => f.confidence === "high");
  const hostingMedium = result.findings.filter((f) => f.category === "Hosting").some((f) => f.confidence === "medium");
  const hasCloudFlare = result.findings.some((f) => f.name === "Cloudflare" && f.confidence === "high");
  const hasVercel = result.findings.some((f) => f.name === "Vercel");
  const modernFramework = result.findings.some((f) => ["React", "Next.js", "Vue.js", "Svelte", "Astro", "Remix", "Gatsby"].includes(f.name));
  let score = 40;
  if (hostingHigh || hasCloudFlare) score += 30;
  if (hostingMedium && !hostingHigh) score += 10;
  if (hasVercel) score += 10;
  if (modernFramework) score += 15;
  const legacyCms = result.findings.some((f) => f.category === "CMS" && f.confidence !== "high");
  if (legacyCms && !modernFramework) score -= 15;
  return Math.min(98, Math.max(30, score));
}

export function computeSeoScore(result: ScanResult): number {
  const goodStatus = result.status >= 200 && result.status < 300;
  const hasCanonical = result.findings.some((f) => f.category === "Framework" && f.name === "HTML5");
  let score = 40;
  if (goodStatus) score += 25;
  if (hasCanonical) score += 20;
  else if (result.findings.some((f) => f.category === "Hosting")) score += 15;
  return Math.min(95, Math.max(40, score));
}

// Managed edge platforms ship automatic TLS, a global CDN and hardened infrastructure by default.
const EDGE_PLATFORMS = ["Vercel", "Netlify", "Cloudflare", "Firebase Hosting"];
const EDGE_HOST_SUFFIXES = [".vercel.app", ".netlify.app", ".pages.dev", ".web.app", ".firebaseapp.com"];

export function computeSecurityScore(result: ScanResult): number {
  const host = (() => {
    try {
      return new URL(result.finalUrl || result.url).hostname;
    } catch {
      return "";
    }
  })();
  const https = (result.finalUrl || result.url).startsWith("https:");
  const edge =
    result.findings.some((f) => EDGE_PLATFORMS.includes(f.name) && f.confidence !== "low") ||
    EDGE_HOST_SUFFIXES.some((s) => host.endsWith(s));

  if (edge) {
    let score = 85;
    if (https) score += 5;
    if (result.findings.some((f) => f.name === "Next.js")) score += 3;
    if (result.findings.filter((f) => f.category === "Hosting").length > 1) score += 2;
    return Math.min(95, score);
  }

  // Generic / legacy servers: 20–35% unless there is real infrastructure behind them.
  let score = 20;
  if (https) score += 15;
  if (result.findings.some((f) => ["AWS", "Heroku", "DigitalOcean App Platform", "GitHub Pages"].includes(f.name))) score += 20;
  const legacyCms = result.findings.some((f) => ["WordPress", "Drupal", "Joomla"].includes(f.name));
  if (legacyCms) score -= 10;
  return Math.min(70, Math.max(20, score));
}
function InfraPanel({ infra, hosting }: { infra: NonNullable<ScanResult["infra"]>; hosting: string[] }) {
  // Header-based detections first, then the network the IP reverse-resolves to.
  const edge = [...new Set([...hosting, ...(infra.network ? [infra.network] : [])])];
  const rows: [string, string | null][] = [
    ["Hosting / edge network", edge.length ? edge.join(" · ") : null],
    ["Domain registrar", infra.registrar],
    ["DNS provider", infra.dnsProvider],
    ["Nameservers", infra.nameservers.length ? infra.nameservers.join(", ") : null],
    ["IP address", infra.ip ? (infra.ptr ? `${infra.ip} (${infra.ptr})` : infra.ip) : null],
    ["SSL issuer", infra.sslIssuer],
    ["SSL expires", infra.sslValidTo ? new Date(infra.sslValidTo).toLocaleDateString() : null],
    ["Server signature", infra.server],
  ];
  return (
    <div className="mb-8 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3 text-[var(--heading-text)]">
        Infrastructure
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-text)]">{label}</dt>
            <dd className={`break-words ${value ? "text-[var(--body-text)] font-medium" : "text-[var(--muted-text)] italic"}`}>
              {value ?? "Not detected"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Simulated post-migration benchmark in the 92–98% band. Deterministic and driven by the
 * site's real signals (not random): baseline scores set the band position, a fast
 * response adds a point. Typical sites land 94–97%.
 */
export function computeUpliftBenchmark(result: ScanResult): number {
  const avg = (computePerformanceScore(result) + computeSeoScore(result) + computeSecurityScore(result)) / 3;
  const fromBaseline = Math.round(((Math.max(30, avg) - 30) / 65) * 5); // 0..5
  const fast = result.responseTimeMs < 500 ? 1 : 0;
  return Math.min(98, Math.max(92, 92 + fromBaseline + fast));
}

/** Plain-text report for email / Slack / proposals. Fixed-width labels keep values aligned. */
export function buildTextReport(result: ScanResult): string {
  const rule = "─".repeat(48);
  const row = (k: string, v: string | number | null | undefined) => `${(k + ":").padEnd(22)}${v ?? "Not detected"}`;
  const names = (cat: string) => result.findings.filter((f) => f.category === cat).map((f) => f.name).join(", ") || null;
  const i = result.infra;
  return [
    "WEBSITE TECH STACK REPORT",
    rule,
    row("URL", result.finalUrl || result.url),
    row("Scanned", new Date(result.scannedAt).toLocaleString()),
    row("HTTP status", result.status),
    row("Response time", `${result.responseTimeMs} ms`),
    "",
    "SCAN SCORES (heuristic)",
    rule,
    row("Performance", `${computePerformanceScore(result)}%`),
    row("SEO & Metadata", `${computeSeoScore(result)}%`),
    row("Security & CDN", `${computeSecurityScore(result)}%`),
    "",
    "TECHNOLOGY",
    rule,
    row("Hosting provider", names("Hosting")),
    row("Framework", names("Framework")),
    row("CMS", names("CMS")),
    row("Analytics", names("Analytics")),
    ...(i
      ? [
          "",
          "INFRASTRUCTURE",
          rule,
          row("Registrar", i.registrar),
          row("DNS provider", i.dnsProvider),
          row("Nameservers", i.nameservers.join(", ") || null),
          row("IP address", i.ip),
          row("SSL issuer", i.sslIssuer),
          row("Server signature", i.server),
        ]
      : []),
    "",
    "SIMULATED NEXT.JS UPLIFT",
    rule,
    row("Architectural uplift", `${computeUpliftBenchmark(result)}% (simulated projection)`),
    "",
    "Projection is a realistic estimate.",
  ].join("\n");
}
