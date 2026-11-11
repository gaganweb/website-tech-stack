import type { ScanResult, Signals } from "@/lib/types";

/** Everything the scores are computed from: measured signals + stack facts derived from findings. */
interface Profile extends Signals {
  ms: number;
  okStatus: boolean;
  edgeCdn: boolean;
  /** 0 = legacy server-rendered CMS, 0.5 = unknown / client-heavy, 1 = SSR/SSG framework. */
  rendering: number;
}

export interface Scores {
  performance: number;
  seo: number;
  security: number;
  overall: number;
}

const EDGE_HOSTS = ["Vercel", "Cloudflare", "Netlify", "AWS", "Firebase Hosting"];
const SSR_FRAMEWORKS = ["Next.js", "Nuxt.js", "Remix", "Astro", "Gatsby", "Svelte"];
const LEGACY_CMS = ["WordPress", "Drupal", "Joomla"];

// No signals (e.g. a stale cached scan) → treat every check as failed rather than invent data.
const EMPTY: Signals = {
  https: false, htmlBytes: Infinity, compression: null, cacheable: false, hasValidator: false,
  hsts: false, csp: false, frameProtection: false, noSniff: false, referrerPolicy: false, permissionsPolicy: false,
  title: false, description: false, canonical: false, viewport: false, lang: false, h1Count: 0, openGraph: false, noindex: false,
};

function profileOf(r: ScanResult): Profile {
  const names = new Set(r.findings.filter((f) => f.confidence !== "low").map((f) => f.name));
  const has = (list: string[]) => list.some((n) => names.has(n));
  return {
    ...EMPTY,
    ...r.signals,
    ms: r.responseTimeMs,
    okStatus: r.status >= 200 && r.status < 300,
    edgeCdn: has(EDGE_HOSTS),
    rendering: has(SSR_FRAMEWORKS) ? 1 : has(LEGACY_CMS) ? 0 : 0.5,
  };
}

/** What Next.js App Router + RSC + Cloudflare edge guarantees by construction. Content-driven checks (h1, noindex, status, HTML weight) are deliberately NOT overridden. */
const MODERN_STACK: Partial<Profile> = {
  ms: 200, // edge-cached TTFB; applied as min() below so already-faster sites don't get slower
  https: true, edgeCdn: true, cacheable: true, hasValidator: true, compression: "br", rendering: 1,
  hsts: true, csp: true, frameProtection: true, noSniff: true, referrerPolicy: true, permissionsPolicy: true, // headers() config + Cloudflare
  title: true, description: true, canonical: true, viewport: true, lang: true, openGraph: true, // Metadata API
};

const pts = (cond: boolean, n: number) => (cond ? n : 0);
const clamp = (n: number) => Math.round(Math.min(98, Math.max(0, n)));

function score(p: Profile): Scores {
  const performance =
    (p.ms < 300 ? 35 : p.ms < 800 ? 28 : p.ms < 1500 ? 18 : p.ms < 3000 ? 8 : 0) +
    pts(p.cacheable, 15) + pts(!p.cacheable && p.hasValidator, 5) +
    pts(p.edgeCdn, 15) +
    (p.compression ? (/br|zstd/.test(p.compression) ? 10 : 8) : 0) +
    (p.htmlBytes < 100_000 ? 10 : p.htmlBytes < 300_000 ? 5 : 0) +
    p.rendering * 10;
  const seo =
    pts(p.okStatus, 10) + pts(p.https, 10) + pts(p.title, 15) + pts(p.description, 20) + pts(p.canonical, 10) +
    pts(p.viewport, 10) + pts(p.lang, 5) + pts(p.openGraph, 10) + (p.h1Count === 1 ? 10 : p.h1Count > 1 ? 5 : 0) -
    pts(p.noindex, 30);
  const security =
    pts(p.https, 25) + pts(p.hsts, 20) + pts(p.csp, 20) + pts(p.frameProtection, 10) + pts(p.noSniff, 10) +
    pts(p.referrerPolicy, 5) + pts(p.permissionsPolicy, 5) + pts(p.edgeCdn, 5);
  const s = { performance: clamp(performance), seo: clamp(seo), security: clamp(security) };
  return { ...s, overall: Math.round((s.performance + s.seo + s.security) / 3) };
}

/** Current scores, and the same page re-scored as if served by the modern stack. Uplift = projected − current. */
export function computeScores(r: ScanResult): { current: Scores; projected: Scores } {
  const p = profileOf(r);
  const modern = { ...p, ...MODERN_STACK, ms: Math.min(p.ms, MODERN_STACK.ms!) };
  const current = score(p);
  const projected = score(modern);
  // An optimized stack never makes a good page worse (e.g. a site already at 98).
  const keep = (a: number, b: number) => Math.max(a, b);
  const merged = {
    performance: keep(current.performance, projected.performance),
    seo: keep(current.seo, projected.seo),
    security: keep(current.security, projected.security),
  };
  return { current, projected: { ...merged, overall: Math.round((merged.performance + merged.seo + merged.security) / 3) } };
}
