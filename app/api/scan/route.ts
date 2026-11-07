import { NextResponse } from "next/server";
import { analyzeUrl } from "@/lib/analyzer";
import { normalizeUrl } from "@/lib/url";
import type { ScanResult } from "@/lib/types";

interface ScanRequest {
  url?: string;
}

export async function POST(request: Request) {
  let body: ScanRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "A 'url' field is required" }, { status: 400 });
  }

  const targetUrl = normalizeUrl(rawUrl);
  if (!targetUrl) {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    const analysis = await analyzeUrl(targetUrl);
    const result: ScanResult = {
      url: targetUrl,
      finalUrl: analysis.finalUrl,
      status: analysis.status,
      responseTimeMs: analysis.responseTimeMs,
      findings: analysis.findings,
      infra: analysis.infra,
      scannedAt: new Date().toISOString(),
    };
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
