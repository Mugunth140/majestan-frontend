import { SEO_API_BASE } from "@/lib/seo-api-base";
import { NextRequest, NextResponse } from "next/server";
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/site-api" || path.startsWith("/site-api/"))
    return siteApiProxy(request);
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
  if (/^\/[^/]+-[a-z]{1,6}\d+\/(amenities|floor-plans?|locality|photos|videos|price|specifications)$/i.test(path)) {
    // Resolve configured alias redirects before rendering. Redirect exceptions raised
    // from both metadata and a cached page can otherwise duplicate Location headers.
    try {
      const result = await fetch(SEO_API_BASE + '/seo-engine/routing', {
        headers: process.env.INTERNAL_API_KEY ? { 'x-internal-key': process.env.INTERNAL_API_KEY } : {},
        signal: AbortSignal.timeout(4000),
      });
      if (result.ok) {
        const payload = await result.json(), routing = payload.data ?? payload;
        const root = path.slice(0, path.lastIndexOf('/'));
        const suffix = path.slice(path.lastIndexOf('/'));
        const direct = routing.redirects?.find((rule: { source: string }) => rule.source === path);
        const parent = routing.redirects?.find((rule: { source: string }) => rule.source === root);
        if (direct || parent) {
          const destination = direct?.destination || parent.destination + (routing.inventory_paths?.includes(parent.destination) ? suffix : '');
          const url = new URL(destination, request.url);
          url.search = request.nextUrl.search;
          return NextResponse.redirect(url, 301);
        }
      }
    } catch { /* The detail renderer still resolves redirects if routing is unavailable. */ }
    const url = request.nextUrl.clone();
    url.pathname = "/detail-section" + path;
    return NextResponse.rewrite(url);
  }
  // Code-suffixed inventory URLs resolve redirects and off-market policies in
  // the detail renderer itself. Avoid a second routing-table API round trip.
  if (/^\/[^/]+-[a-z]{1,6}\d+$/i.test(path)) {
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
    if (path === "/privacy-policy" || path === "/terms-and-conditions") {
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
