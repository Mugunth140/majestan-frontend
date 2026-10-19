import { seoFetch } from '@/lib/seo-engine';
export const dynamic='force-dynamic';
export async function GET(){const data=await seoFetch('llms');if(!data?.text)return new Response('Inventory summary temporarily unavailable',{status:503});return new Response(data.text,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});}
