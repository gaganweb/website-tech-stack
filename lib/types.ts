import type { Infra } from "@/lib/infra";

export type Category = "CMS" | "Hosting" | "Analytics" | "Framework";

export type Confidence = "high" | "medium" | "low";

export interface Finding {
  id: string;
  category: Category;
  name: string;
  confidence: Confidence;
  detail?: string;
}

/** Raw facts measured from the response; turned into scores by lib/scoring.ts. */
export interface Signals {
  https: boolean;
  htmlBytes: number;
  compression: string | null;
  cacheable: boolean;
  hasValidator: boolean;
  hsts: boolean;
  csp: boolean;
  frameProtection: boolean;
  noSniff: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
  title: boolean;
  description: boolean;
  canonical: boolean;
  viewport: boolean;
  lang: boolean;
  h1Count: number;
  openGraph: boolean;
  noindex: boolean;
}

export interface ScanResult {
  signals?: Signals;
  url: string;
  finalUrl: string;
  status: number;
  responseTimeMs: number;
  findings: Finding[];
  scannedAt: string;
  infra?: Infra;
}
