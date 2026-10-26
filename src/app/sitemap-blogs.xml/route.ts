import { BLOG_SITE, blogFetch, postUrl, isoDate } from "@/lib/blog";
export const dynamic = "force-dynamic";
const xml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
export async function GET() {
  try {
    const posts =
      await blogFetch<{ slug: string; updated_at: string }[]>("/sitemap");
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${BLOG_SITE}/blogs</loc></url>${posts.map((p) => `<url><loc>${xml(postUrl(p.slug))}</loc><lastmod>${isoDate(p.updated_at)}</lastmod></url>`).join("")}</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503 });
  }
}
