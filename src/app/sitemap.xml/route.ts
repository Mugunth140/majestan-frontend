import { SEO_SITE } from '@/lib/seo-engine';
export const dynamic='force-dynamic';
export function GET(){return new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['projects','properties-buy','properties-rent','localities','pages','blogs'].map(g=>`<sitemap><loc>${SEO_SITE}/sitemap-${g}.xml</loc></sitemap>`).join('')}</sitemapindex>`,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store'}});}
