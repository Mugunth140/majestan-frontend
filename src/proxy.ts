import { SEO_API_BASE } from "@/lib/seo-api-base";
import { NextRequest, NextResponse } from "next/server";
export async function proxy(request: NextRequest) {
  // Server Action IDs are hashes. Reject scanner payloads before RSC handling.
  const action = request.headers.get("next-action");
  if (request.method === "POST" && action !== null && !/^[a-f0-9]{40,64}$/i.test(action)) {
    return new NextResponse(null, { status: 404 });
  }
  const path = request.nextUrl.pathname;
  if (path === "/site-api" || path.startsWith("/site-api/"))
    return siteApiProxy(request);
  if (path === "/blogs" || path.startsWith("/blogs/")) {
    const blogSlug = /^\/blogs\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(path)?.[1];
    if (blogSlug) {
      try {
        const response = await fetch(`${SEO_API_BASE}/editorial/routing/resolve?slug=${encodeURIComponent(blogSlug)}`, {
          cache: 'no-store', signal: AbortSignal.timeout(4000),
          headers: process.env.INTERNAL_API_KEY ? {'x-internal-key':process.env.INTERNAL_API_KEY} : {},
        });
        if (response.ok) {
          const payload = await response.json(), target = (payload.data ?? payload).slug;
          if (typeof target === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target) && target !== blogSlug) {
            const url = request.nextUrl.clone(); url.pathname = '/blogs/' + target;
            return NextResponse.redirect(url, 301);
          }
        }
      } catch { /* The page still handles missing articles and upstream errors. */ }
    }
    return NextResponse.next();
  }
  if (path.startsWith("/admin")) return NextResponse.next();
  // Hide the internal rendering route; public URLs and canonicals stay unchanged.
  if (/^\/(detail-render|detail-section|seo-route|seo-section)\//.test(path)) {
    const url = request.nextUrl.clone();
    url.pathname = path.replace(/^\/(detail-render|detail-section|seo-route|seo-section)/, "");
    return NextResponse.redirect(url, 308);
  }
  // Inventory slugs are lowercase. Preserve a canonical redirect for shared
  // uppercase links before the SEO API rejects them as an invalid path.
  if (/^\/[^/]+-[a-z]{1,6}\d+(?:\/(?:amenities|floor-plans?|locality|photos|videos|price|specifications))?$/i.test(path)
    && path !== path.toLowerCase()) {
    const url = request.nextUrl.clone();
    url.pathname = path.toLowerCase();
    return NextResponse.redirect(url, 308);
  }
  // The old site's "/overview" tab is the listing page itself.
  if (/^\/[^/]+-[a-z]{1,6}\d+\/overview$/i.test(path)) {
    const routing = await routingTable();
    const root = path.slice(0, -"/overview".length).toLowerCase();
    const destination = routing?.redirects?.find((rule: { source: string }) => rule.source === root)?.destination
      || (routing?.inventory_paths?.includes(root) ? root : null);
    // Unknown listings stay a plain 404 rather than a redirect to one.
    if (destination) {
      const url = new URL(destination, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    }
  }
  if (/^\/[^/]+-[a-z]{1,6}\d+\/(amenities|floor-plans?|locality|photos|videos|price|specifications)$/i.test(path)) {
    // Resolve configured alias redirects before rendering. Redirect exceptions raised
    // from both metadata and a cached page can otherwise duplicate Location headers.
    {
      const routing = await routingTable();
      if (routing) {
        const root = path.slice(0, path.lastIndexOf('/'));
        const suffix = path.slice(path.lastIndexOf('/'));
        const direct = routing.redirects?.find((rule: { source: string }) => rule.source === path);
        const parent = routing.redirects?.find((rule: { source: string }) => rule.source === root);
        if (direct || parent) {
          const destination = direct?.destination || parent!.destination + (routing.inventory_paths?.includes(parent!.destination) ? suffix : '');
          const url = new URL(destination, request.url);
          url.search = request.nextUrl.search;
          return NextResponse.redirect(url, 301);
        }
      }
    }
    const url = request.nextUrl.clone();
    url.pathname = "/detail-section" + path;
    return NextResponse.rewrite(url);
  }
  // Code-suffixed inventory URLs: answer moved URLs here. A redirect thrown by the
  // cached detail renderer can be replayed from the ISR cache as a 308 with no
  // Location header, which Search Console reports as a broken redirect.
  if (/^\/[^/]+-[a-z]{1,6}\d+$/i.test(path)) {
    const moved = (await routingTable())?.redirects?.find((rule: { source: string }) => rule.source === path);
    if (moved) {
      const url = new URL(moved.destination, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/detail-render" + path;
    return NextResponse.rewrite(url);
  }
  const base = SEO_API_BASE;
  try {
    const res = await fetch(base + "/seo-engine/routing", {
      cache: "no-store",
      headers: process.env.INTERNAL_API_KEY
        ? { "x-internal-key": process.env.INTERNAL_API_KEY }
        : {},
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return NextResponse.next();
    const payload = await res.json(),
      data = payload.data ?? payload;
    const redirect = data.redirects?.find(
      (r: { source: string }) => r.source === path,
    );
    if (redirect) {
      const dest = new URL(redirect.destination, request.url);
      dest.search = request.nextUrl.search;
      return NextResponse.redirect(dest, 301);
    }
    // Legal pages have dedicated routes; keep them out of the legacy view wrapper.
    if (path === "/privacy-policy" || path === "/terms-and-conditions" || path === "/data-deletion") {
      return NextResponse.next();
    }
    const sections = [
      "amenities",
      "floor-plan",
      "floor-plans",
      "locality",
      "photos",
      "videos",
      "price",
      "specifications",
    ];
    const parentPath = path.slice(0, path.lastIndexOf('/'));
    const section = path.slice(path.lastIndexOf('/') + 1);
    const parentRedirect = sections.includes(section) && data.redirects?.find((rule: { source: string }) => rule.source === parentPath);
    if (parentRedirect) {
      const destination = parentRedirect.destination + (data.inventory_paths?.includes(parentRedirect.destination) ? '/' + section : '');
      const url = new URL(destination, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    }
    if (
      data.inventory_paths?.some(
        (base: string) =>
          path.startsWith(base + "/") &&
          sections.includes(path.slice(base.length + 1)),
      )
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/detail-section" + path;
      return NextResponse.rewrite(url);
    }
    if (data.inventory_paths?.includes(path)) {
      const url = request.nextUrl.clone();
      url.pathname = "/detail-render" + path;
      return NextResponse.rewrite(url);
    }
    if (data.paths?.includes(path)) {
      const url = request.nextUrl.clone();
      url.pathname = "/seo-route" + path;
      return NextResponse.rewrite(url);
    }
  } catch {
    /* Public fallback remains available during a routing service outage. */
  }
  return NextResponse.next();
}
// The routing table changes only when SEO or redirects are saved; a short
// in-process copy keeps detail pages to one backend call per 30 seconds.
type Routing = {
  redirects?: { source: string; destination: string }[];
  inventory_paths?: string[];
  paths?: string[];
};
let routingCopy: { expires: number; value: Routing } | undefined;
/** Tests only: forget the in-process routing copy. */
export function resetRoutingTable() {
  routingCopy = undefined;
}
async function routingTable(): Promise<Routing | null> {
  if (routingCopy && routingCopy.expires > Date.now()) return routingCopy.value;
  try {
    const result = await fetch(SEO_API_BASE + "/seo-engine/routing", {
      cache: "no-store",
      headers: process.env.INTERNAL_API_KEY ? { "x-internal-key": process.env.INTERNAL_API_KEY } : {},
      signal: AbortSignal.timeout(4000),
    });
    if (!result.ok) return routingCopy?.value ?? null;
    const payload = await result.json();
    routingCopy = { expires: Date.now() + 30_000, value: payload.data ?? payload };
    return routingCopy.value;
  } catch {
    // The detail renderer still resolves redirects if routing is unavailable.
    return routingCopy?.value ?? null;
  }
}

export const config = {
  matcher: [
    "/site-api/:path*",
    "/seo-route/:path*",
    "/seo-section/:path*",
    "/detail-render/:path*",
    "/detail-section/:path*",
    "/((?!api|_next|assets|favicon|.*\\.).*)",
  ],
};

// Runtime (per-request) proxy to the site backend. Unlike next.config
// rewrites, this reads SITE_BACKEND_URL at request time so the same image
// works in every environment without rebuilds.
function siteApiProxy(request: NextRequest) {
  const fromApiBase = (process.env.API_BASE_URL || "").replace(
    /\/api\/v1\/?$/,
    "",
  );
  const base =
    process.env.SITE_BACKEND_URL || fromApiBase || "http://localhost:5000";
  const path = request.nextUrl.pathname.replace(/^\/site-api/, "");
  const url = new URL(
    `${base.replace(/\/$/, "")}/api/v1${path}${request.nextUrl.search}`,
  );

  // Every proxied call reaches the backend from this server's IP. With the
  // shared key, pass the visitor's IP (Caddy sets X-Real-IP) so the backend
  // rate-limits per visitor instead of one budget for everyone. Always
  // overwrite both headers so a browser can't supply its own.
  const key = process.env.INTERNAL_API_KEY;
  if (key) {
    const headers = new Headers(request.headers);
    const clientIp =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    headers.set("x-internal-key", key);
    headers.set("x-client-ip", clientIp);
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.rewrite(url);
}
