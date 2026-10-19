import { seoFetch,SEO_SITE } from '@/lib/seo-engine';
export const dynamic='force-dynamic';
export async function GET(){const data=await seoFetch('robots');return new Response(data?.text||`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${SEO_SITE}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});}
