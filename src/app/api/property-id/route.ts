import { NextRequest, NextResponse } from "next/server";
import { propertyIdCandidates } from "@/lib/property-id";

const API_BASE = process.env.API_BASE_URL || "http://localhost:5000/api/v1";

/**
 * Exact property-ID lookup for the hero search: GET /api/property-id?q=AP8471
 * → { url: "/<canonical-slug>" } or 404. Only the URL is returned, never the
 * property payload. The backend's by-slug endpoint already matches
 * propertyCode and only serves approved listings.
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").slice(0, 40);
  for (const code of propertyIdCandidates(q)) {
    try {
      const res = await fetch(`${API_BASE}/properties/by-slug/${encodeURIComponent(code)}`, {
        next: { revalidate: 300, tags: ["public-inventory"] },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const body = await res.json();
      const data = body?.data ?? body;
      const slug = data?.canonicalSlug || data?.slug;
      if (typeof slug === "string" && slug && !slug.includes("/")) {
        return NextResponse.json({ url: `/${slug}`, code: data?.propertyCode ?? code });
      }
    } catch {
      // Try the next candidate; a backend hiccup falls through to 404.
    }
  }
  return NextResponse.json({ url: null }, { status: 404 });
}
