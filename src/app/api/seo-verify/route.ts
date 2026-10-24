import { NextRequest, NextResponse } from 'next/server';
import { SEO_API_BASE } from '@/lib/seo-api-base';
import { SEO_SITE } from '@/lib/seo-engine';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const auth = await fetch(SEO_API_BASE + '/seo-admin/auth/me', { headers: { Cookie: request.headers.get('cookie') || '' }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!auth.ok) return NextResponse.json({ message: 'Sign in to verify public SEO' }, { status: auth.status });
  const path = request.nextUrl.searchParams.get('path') || '';
  if (!/^\/[a-z0-9/_.%&'()+,;=@!$~-]*$/.test(path) || path.startsWith('//') || /^\/(admin|api|site-api|_next)(\/|$)/.test(path)) return NextResponse.json({ message: 'Choose a public site path' }, { status: 400 });
  try {
    const response = await fetch(new URL(path, SEO_SITE), { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const html = (await response.text()).slice(0, 3000000);
    const attribute = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] || '';
    const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]).find(tag => attribute(tag, 'rel') === 'canonical') || '';
    const robotsTag = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]).find(tag => attribute(tag, 'name') === 'robots') || '';
    return NextResponse.json({ status: response.status, title: html.match(/<title>([\s\S]*?)<\/title>/i)?.[1], canonical: attribute(canonicalTag, 'href'), robots: attribute(robotsTag, 'content'), location: response.headers.get('location') }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ message: 'Public page verification timed out or failed' }, { status: 502 }); }
}
