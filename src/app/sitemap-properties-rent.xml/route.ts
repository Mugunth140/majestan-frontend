import { SEO_API_BASE } from "@/lib/seo-api-base";
export const dynamic = "force-dynamic";
export async function GET() {
  const base = SEO_API_BASE;
  try {
    const res = await fetch(base + "/seo-engine/sitemap/properties-rent", {
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
      headers: process.env.INTERNAL_API_KEY
        ? { "x-internal-key": process.env.INTERNAL_API_KEY }
        : {},
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503 });
  }
}
