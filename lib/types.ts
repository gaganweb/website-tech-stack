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

export interface ScanResult {
  url: string;
  finalUrl: string;
  status: number;
  responseTimeMs: number;
  findings: Finding[];
  scannedAt: string;
  infra?: Infra;
}
