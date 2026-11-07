import { promises as dns } from "node:dns";
import tls from "node:tls";

export interface Infra {
  ip: string | null;
  ptr: string | null;
  network: string | null;
  nameservers: string[];
  dnsProvider: string | null;
  registrar: string | null;
  sslIssuer: string | null;
  sslValidTo: string | null;
  server: string | null;
}

const DNS_PROVIDERS: [RegExp, string][] = [
  [/cloudflare\.com$/, "Cloudflare"],
  [/awsdns/, "Amazon Route 53"],
  [/azure-dns/, "Azure DNS"],
  [/google(domains)?\.com$|googledomains/, "Google Cloud DNS"],
  [/domaincontrol\.com$/, "GoDaddy"],
  [/vercel-dns\.com$/, "Vercel"],
  [/nsone\.net$/, "NS1"],
  [/registrar-servers\.com$/, "Namecheap"],
  [/wixdns\.net$/, "Wix"],
  [/squarespacedns\.com$/, "Squarespace"],
];

// Reverse-DNS (PTR) hostname patterns → hosting network.
const PTR_NETWORKS: [RegExp, string][] = [
  [/amazonaws\.com$|cloudfront\.net$/, "Amazon Web Services"],
  [/googleusercontent\.com$|1e100\.net$/, "Google Cloud"],
  [/cloudapp\.(azure|net)|azure/, "Microsoft Azure"],
  [/digitalocean/, "DigitalOcean"],
  [/linode|akamai/, "Akamai / Linode"],
  [/vultr/, "Vultr"],
  [/hetzner|your-server\.de$/, "Hetzner"],
  [/ovh\./, "OVHcloud"],
  [/fastly/, "Fastly"],
  [/vercel/, "Vercel"],
  [/netlify/, "Netlify"],
  [/github\.com$/, "GitHub"],
];

// Fail fast: every lookup is optional and must not stall the scan.
function withTimeout<T>(p: Promise<T>, ms = 4000): Promise<T | null> {
  return Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]).catch(() => null);
}

// shortcut: guesses the registrable domain without the public suffix list (handles co.uk-style 2-letter ccTLDs only); use a PSL lib if odd TLDs misreport.
export function registrableDomain(host: string): string {
  const parts = host.replace(/\.$/, "").split(".");
  const n = parts.length;
  if (n <= 2) return host;
  const take = parts[n - 1].length === 2 && parts[n - 2].length <= 3 ? 3 : 2;
  return parts.slice(-take).join(".");
}

async function registrar(domain: string): Promise<string | null> {
  const res = await fetch(`https://rdap.org/domain/${domain}`, {
    // rdap.org returns 403 to requests without a browser-like User-Agent.
    headers: { Accept: "application/rdap+json", "User-Agent": "Mozilla/5.0 (compatible; WebsiteScanner/1.0)" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { entities?: { roles?: string[]; vcardArray?: [string, [string, object, string, string][]] }[] };
  const ent = data.entities?.find((e) => e.roles?.includes("registrar"));
  const fn = ent?.vcardArray?.[1]?.find((f) => f[0] === "fn");
  return fn ? String(fn[3]) : null;
}

function sslInfo(host: string): Promise<{ issuer: string | null; validTo: string | null }> {
  return new Promise((resolve, reject) => {
    const sock = tls.connect({ host, port: 443, servername: host, timeout: 4000 }, () => {
      const cert = sock.getPeerCertificate();
      sock.end();
      const issuer = cert?.issuer ? [cert.issuer.O, cert.issuer.CN].filter(Boolean).join(" · ") : null;
      resolve({ issuer: issuer || null, validTo: cert?.valid_to ?? null });
    });
    sock.on("error", reject);
    sock.on("timeout", () => sock.destroy(new Error("timeout")));
  });
}

export async function getInfra(finalUrl: string, server: string | null): Promise<Infra> {
  const { hostname, protocol } = new URL(finalUrl);
  const domain = registrableDomain(hostname);
  const [ip, ns, reg, ssl] = await Promise.all([
    withTimeout(dns.lookup(hostname).then((r) => r.address)),
    withTimeout(dns.resolveNs(domain)),
    withTimeout(registrar(domain)),
    protocol === "https:" ? withTimeout(sslInfo(hostname)) : Promise.resolve(null),
  ]);
  const ptr = ip ? ((await withTimeout(dns.reverse(ip), 2000))?.[0]?.toLowerCase() ?? null) : null;
  const network = ptr ? (PTR_NETWORKS.find(([re]) => re.test(ptr))?.[1] ?? null) : null;
  const nameservers = (ns ?? []).map((s) => s.toLowerCase()).sort();
  const dnsProvider = DNS_PROVIDERS.find(([re]) => nameservers.some((s) => re.test(s)))?.[1] ?? null;
  return {
    ip,
    ptr,
    network,
    nameservers,
    dnsProvider,
    registrar: reg,
    sslIssuer: ssl?.issuer ?? null,
    sslValidTo: ssl?.validTo ?? null,
    server,
  };
}
