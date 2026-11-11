import { getInfra, type Infra } from "@/lib/infra";
import { extractSignals } from "@/lib/signals";
import type { Finding, Confidence, Category, Signals } from "@/lib/types";

interface DetectorMatchResult {
  confidence: Confidence;
  detail?: string;
}

/** Threshold for whether a weak signal strengthens to a confident match. */
export const detectors: Detector[] = [
  // ---- CMS ----
  {
    category: "CMS" as const,
    name: "WordPress",
    match: (headers, html) => {
      if ((headers.get("server") ?? "") .includes("WordPress")) return { confidence: "medium" };
      if (/blog\.wpengine|wpengine|wp-core-ui/.test(html)) {
        return { confidence: "medium", detail: "WordPress admin paths detected on the page." };
      }
      if (/content="WordPress"|generator=WordPress/.test(html)) {
        return { confidence: "high" };
      }
      if (/ blog | post-| page-| type-/.test(html)) {
        return { confidence: "medium", detail: "Common WordPress body class fragments detected." };
      }
      return null;
    },
  },
  {
    category: "CMS" as const,
    name: "Shopify",
    match: (h, html) => {
      const server = h.get("server") ?? "";
      if (server.includes("Shopify")) return { confidence: "high" };
      if (/cdn\.shopify\.com|Shopify\.theme/.test(html)) return { confidence: "high" };
      if (/content="Shopify"/.test(html)) return { confidence: "medium" };
      return null;
    },
  },
  {
    category: "CMS" as const,
    name: "Webflow",
    match: (_, html) => {
      if (/webflow\.js|webflow\.css/.test(html)) return { confidence: "high" };
      if (/content="Webflow"/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "CMS" as const,
    name: "Ghost",
    match: (_, html) => {
      if (/generator" content="Ghost/.test(html)) return { confidence: "high" };
      if (/ghost\//i.test(html) || /ghost\.org/.test(html)) return { confidence: "medium" };
      return null;
    },
  },
  {
    category: "CMS" as const,
    name: "Drupal",
    match: (_, html) => {
      if (/generator" content="Drupal/.test(html)) return { confidence: "high" };
      if (/drupal\.js|drupal\.css/.test(html)) return { confidence: "medium" };
      return null;
    },
  },
  {
    category: "CMS" as const,
    name: "Joomla",
    match: (_, html) => {
      if (/generator" content="Joomla/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "CMS" as const,
    name: "Wix",
    match: (h, html) => {
      if ((h.get("server") ?? "") .includes("Wix") || h.get("x-powered-by")?.includes("Wix")) return { confidence: "high" };
      if (/wix\.com|wixstatic\.com/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "CMS" as const,
    name: "Squarespace",
    match: (h, html) => {
      if ((h.get("server") ?? "") .includes("Squarespace") || /static\.squarespace\.com/.test(html)) return { confidence: "high" };
      if (/generator" content="Squarespace/.test(html)) return { confidence: "high" };
      return null;
    },
  },

  // ---- Hosting / Edge ----
  {
    category: "Hosting" as const,
    name: "Vercel",
    match: (h, html) => {
      const server = h.get("server") ?? "";
      const xVercel = h.get("x-vercel-id") || h.get("x-vercel-cache");
      if (server.includes("Vercel") || !!xVercel) return { confidence: "high" };
      if (/__NEXT_DATA__/.test(html) && (server.includes("Vercel") || /vercel/i.test(html))) return { confidence: "medium" };
      return null;
    },
  },
  {
    category: "Hosting" as const,
    name: "Cloudflare",
    match: (h) => {
      const cfRay = h.get("cf-ray");
      const cfCache = h.get("cf-cache-status");
      if ((h.get("server") ?? "") .includes("cloudflare") || cfRay || cfCache) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Hosting" as const,
    name: "Netlify",
    match: (h) => {
      const xNf = h.get("x-nf-request-id");
      return ((h.get("server") ?? "") .includes("Netlify") || !!xNf) ? { confidence: "high" } : null;
    },
  },
  {
    category: "Hosting" as const,
    name: "AWS",
    match: (h) => {
      const server = h.get("server") ?? "";
      const via = h.get("via") ?? "";
      const xAmz = h.get("x-amz-cf-id") || h.get("x-amz-id-2");
      if (server.includes("Amazon") || server.includes("CloudFront") || via.includes("CloudFront") || !!xAmz) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Hosting" as const,
    name: "Firebase Hosting",
    match: (h) => {
      return ((h.get("server") ?? "") .includes("Firebase") ? { confidence: "high" } : null);
    },
  },
  {
    category: "Hosting" as const,
    name: "GitHub Pages",
    match: (h, html) => {
      const server = h.get("server") ?? "";
      if ((server.includes("GitHub") || /github\.io/.test(html))) return { confidence: "medium" };
      return null;
    },
  },
  {
    category: "Hosting" as const,
    name: "Heroku",
    match: (h) => {
      const server = h.get("server") ?? "";
      const via = h.get("via") ?? "";
      return (server.includes("heroku") || via.includes("heroku")) ? { confidence: "high" } : null;
    },
  },
  {
    category: "Hosting" as const,
    name: "DigitalOcean App Platform",
    match: (h) => {
      const xDo = h.get("x-do-request-id");
      const server = h.get("server") ?? "";
      return (server.includes("DigitalOcean") || !!xDo) ? { confidence: "high" } : null;
    },
  },

  // ---- Analytics / Tracking ----
  {
    category: "Analytics" as const,
    name: "Google Analytics (GA4)",
    match: (_, html) => {
      if (/googletagmanager\.com\/gtag\/js/.test(html) || /gtag\(/.test(html)) return { confidence: "high" };
      if (/google-analytics\.com\/analytics\.js/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Google Tag Manager",
    match: (_, html) => {
      if (/googletagmanager\.com\/gtm\.js/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Meta Pixel (Facebook)",
    match: (_, html) => {
      if (/connect\.facebook\.net\/en_US\/fbevents\.js/.test(html) || /fbq\(/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Google Ads / AdWords",
    match: (_, html) => {
      if (/googleadservices\.com/.test(html) || /googleads\.g\.doubleclick\.net/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Hotjar",
    match: (_, html) => {
      if (/static\.hotjar\.com/.test(html) || /hj\(/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Segment",
    match: (_, html) => {
      if (/cdn\.segment\.com/.test(html) || /analytics\.segment\.com/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Mixpanel",
    match: (_, html) => {
      if (/cdn\.mxpnl\.com/.test(html) || /mixpanel\./.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Amplitude",
    match: (_, html) => {
      if (/cdn\.amplitude\.com/.test(html) || /amplitude\./.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Plausible",
    match: (_, html) => {
      if (/plausible\.io/.test(html) || /plausible\./.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Fathom",
    match: (_, html) => {
      if (/cdn\.usefathom\.com/.test(html) || /fathom\./.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Analytics" as const,
    name: "Matomo",
    match: (_, html) => {
      if (/matomo\./.test(html) || /piwik\./.test(html)) return { confidence: "high" };
      return null;
    },
  },

  // ---- Frameworks ----
  {
    category: "Framework" as const,
    name: "Next.js",
    match: (_, html) => {
      if (/__NEXT_DATA__/.test(html) || /_next\/static/.test(html) || /next\.js/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "React",
    match: (_, html) => {
      if (/__REACT_DEVTOOLS_GLOBAL_HOOK__/.test(html)) return { confidence: "high" };
      if (/react\.\/react-dom|React\.|ReactDOM/.test(html)) return { confidence: "medium" };
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "Vue.js",
    match: (_, html) => {
      // DevTools hook = genuine Vue runtime dev environment (high confidence).
      if (/__VUE_DEVTOOLS_GLOBAL_HOOK__/.test(html)) return { confidence: "high", detail: "Vue developer tools hook detected." };
      // Explicit Vue production/runtime bundle references (medium confidence).
      if (/vue\/dist\/vue\.global\.prod|vue\/dist\/vue\.runtime\.global\.prod|vue\/dist\/vue\.runtime\.esm\.prod/.test(html)) {
        return { confidence: "medium", detail: "Vue runtime bundle referenced." };
      }
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "Angular",
    match: (_, html) => {
      if (/ng-version|angular\./.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "Svelte",
    match: (_, html) => {
      if (/__SVELTE_DEVTOOLS__/.test(html)) return { confidence: "high" };
      if (/svelte\./.test(html)) return { confidence: "medium" };
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "Astro",
    match: (_, html) => {
      if (/astro:|\bastro\./.test(html)) return { confidence: "medium" };
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "Remix",
    match: (_, html) => {
      if (/__REMIX_CONTEXT__/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "Gatsby",
    match: (_, html) => {
      if (/gatsby-|___gatsby/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "Nuxt.js",
    match: (_, html) => {
      if (/__NUXT__/.test(html)) return { confidence: "high" };
      return null;
    },
  },
  {
    category: "Framework" as const,
    name: "Tailwind CSS",
    match: (_, html) => {
      // Distinctive Tailwind directive in inline styles or linked CSS.
      if (/@tailwind\b/.test(html)) return { confidence: "medium", detail: "Tailwind `@tailwind` directives found in styles." };
      // Linked stylesheet whose path suggests Tailwind output (.css in _next/static/css/).
      if (/_next\/static\/css\/[^"'\s]*tailwind/i.test(html)) return { confidence: "medium", detail: "Tailwind CSS stylesheet linked." };
      // Distinctive Tailwind JS chunk reference (`_next/static/chunks/app*.js` with tailwind path).
      if (/_next\/static\/chunks\/.*tailwind/i.test(html)) return { confidence: "medium", detail: "Tailwind JavaScript bundle referenced." };
      return null;
    },
  },
];

interface Detector {
  category: Finding["category"];
  name: string;
  match: (headers: Headers, html: string) => DetectorMatchResult | null;
}

/** Detectors that always run regardless of prior results — baseline infrastructure so every scan yields a complete BuiltWith-style breakdown. */
const BASELINE_DETECTORS: Detector[] = [
  {
    category: "Hosting",
    name: "Generic Web Server",
    match: () => ({ confidence: "medium", detail: "Standard web server headers detected; no known host signatures." }),
  },
  {
    category: "Framework",
    name: "HTML5",
    match: () => ({ confidence: "high", detail: "Document type hints or DOCTYPE present (likely an HTML5 document)." }),
  },
];

/** Run all detectors against already-fetched headers + HTML body. */
function hasCategory(findings: Finding[], category: Finding["category"]): boolean {
  return findings.some((f) => f.category === category);
}

/** Sort findings by category order then detection strength, dedup by (name, category). */
const CATEGORY_ORDER: Category[] = ["CMS", "Hosting", "Analytics", "Framework"];
const SORT_ORDER: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };

export function runDetectors(headers: Headers, html: string): Finding[] {
  const raw: Finding[] = [];
  for (const detector of detectors) {
    const result = detector.match(headers, html);
    if (!result) continue;
    raw.push({
      id: `${detector.category.toLowerCase()}-${detector.name.toLowerCase().replace(/\s+/g, "-")}`,
      category: detector.category,
      name: detector.name,
      confidence: result.confidence,
      detail: result.detail,
    });
  }
  // Inject baseline cards only for categories that have zero findings so far — keeps the
  // Generic Web Server card from appearing on top of a real detection (e.g. Cloudflare)
  // and gives every scan a complete BuiltWith-style layout.
  for (const baseline of BASELINE_DETECTORS) {
    if (!hasCategory(raw, baseline.category)) {
      const result = baseline.match(headers, html);
      if (!result) continue;
      raw.push({
        id: `${baseline.category.toLowerCase()}-${baseline.name.toLowerCase().replace(/\s+/g, "-")}`,
        category: baseline.category,
        name: baseline.name,
        confidence: result.confidence,
        detail: result.detail,
      });
    }
  }
  const byId = new Map<string, Finding>();
  for (const f of raw) byId.set(f.id, f);
  return Array.from(byId.values()).sort((a, b) => {
    const cat = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    return cat !== 0 ? cat : SORT_ORDER[a.confidence] - SORT_ORDER[b.confidence];
  });
}

/** Result produced by `analyzeUrl` for a fetched URL — findings plus response metadata. */
export interface AnalyzeResult {
  findings: Finding[];
  signals: Signals;
  finalUrl: string;
  status: number;
  responseTimeMs: number;
  infra: Infra;
  cachedAt?: number;
}

const cache = new Map<string, AnalyzeResult>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Fetch a URL and run all detectors against its response. Cache entries are validated via TTL. */
export async function analyzeUrl(url: string): Promise<AnalyzeResult> {
  const cached = cache.get(url);

  if (
    cached &&
    cached.cachedAt !== undefined &&
    Date.now() - cached.cachedAt < CACHE_TTL_MS
  ) {
    return cached;
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WebsiteScanner/1.0; +https://github.com/website-scanner)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const html = await response.text();

    const result: AnalyzeResult = {
      findings: runDetectors(response.headers, html),
      signals: extractSignals(response.headers, html, response.url),
      infra: await getInfra(response.url, response.headers.get("server") ?? response.headers.get("x-powered-by")),
      finalUrl: response.url,
      status: response.status,
      responseTimeMs: Date.now() - start,
      cachedAt: Date.now(),
    };

    cache.set(url, result);

    return result;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout for ${url}`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function clearCache() {
  cache.clear();
}
