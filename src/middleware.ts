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
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/site-api/:path*",
};
