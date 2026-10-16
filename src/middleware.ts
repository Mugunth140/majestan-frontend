import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Runtime (per-request) proxy to the site backend. Unlike next.config
// rewrites, this reads SITE_BACKEND_URL at request time so the same image
// works in every environment without rebuilds.
export function middleware(request: NextRequest) {
  const fromApiBase = (process.env.API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');
  const base =
    process.env.SITE_BACKEND_URL || fromApiBase || "http://localhost:5000";
  const path = request.nextUrl.pathname.replace(/^\/site-api/, "");
  const url = new URL(`${base.replace(/\/$/, "")}/api/v1${path}${request.nextUrl.search}`);

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

export const config = {
  matcher: "/site-api/:path*",
};
