import type { Signals } from "@/lib/types";

/** Parse every attribute of a single tag into a lowercase-keyed map. */
function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? "";
  return out;
}

/** Extract the raw, scoreable facts from a response. Pure; scoring happens in lib/scoring.ts. */
export function extractSignals(headers: Headers, html: string, finalUrl: string): Signals {
  const metas = (html.match(/<meta\b[^>]*>/gi) ?? []).map(attrs);
  const meta = (key: string) =>
    metas.find((a) => (a.name ?? a.property ?? "").toLowerCase() === key)?.content?.trim() ?? "";
  const cc = (headers.get("cache-control") ?? "").toLowerCase();
  const maxAge = Math.max(
    Number(/(?:^|[\s,])max-age=(\d+)/.exec(cc)?.[1] ?? 0),
    Number(/s-maxage=(\d+)/.exec(cc)?.[1] ?? 0),
  );
  const edgeHit = /hit|stale/i.test(
    `${headers.get("cf-cache-status") ?? ""} ${headers.get("x-vercel-cache") ?? ""} ${headers.get("x-cache") ?? ""}`,
  );
  const canonical = (html.match(/<link\b[^>]*>/gi) ?? []).map(attrs).some((a) => a.rel?.toLowerCase() === "canonical" && a.href);
  const has = (h: string) => headers.has(h);
  const csp = has("content-security-policy");

  return {
    https: finalUrl.startsWith("https:"),
    htmlBytes: Buffer.byteLength(html),
    compression: headers.get("content-encoding"),
    cacheable: !cc.includes("no-store") && (maxAge > 0 || edgeHit),
    hasValidator: has("etag") || has("last-modified"),
    hsts: has("strict-transport-security"),
    csp,
    frameProtection: has("x-frame-options") || /frame-ancestors/i.test(headers.get("content-security-policy") ?? ""),
    noSniff: (headers.get("x-content-type-options") ?? "").toLowerCase() === "nosniff",
    referrerPolicy: has("referrer-policy"),
    permissionsPolicy: has("permissions-policy"),
    title: /<title[^>]*>\s*\S/i.test(html),
    description: meta("description").length > 0,
    canonical,
    viewport: meta("viewport").length > 0,
    lang: /<html\b[^>]*\blang\s*=\s*["']?[a-z]/i.test(html),
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    openGraph: metas.some((a) => (a.property ?? "").toLowerCase() === "og:title") && metas.some((a) => (a.property ?? "").toLowerCase() === "og:description" || (a.property ?? "").toLowerCase() === "og:image"),
    noindex: /noindex/i.test(meta("robots")) || /noindex/i.test(headers.get("x-robots-tag") ?? ""),
  };
}
